import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: any;
  tags?: string[];
}

export interface Reply {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  createdAt: any;
}

export const firestoreService = {
  getPosts: async (): Promise<Post[]> => {
    const path = 'posts';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  subscribeToPosts: (callback: (posts: Post[]) => void) => {
    const path = 'posts';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  createPost: async (postData: Omit<Post, 'id' | 'authorId' | 'createdAt'>) => {
    const path = 'posts';
    if (!auth.currentUser) throw new Error("Auth required");
    try {
      return await addDoc(collection(db, path), {
        ...postData,
        authorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  getPost: async (postId: string): Promise<Post | null> => {
    const path = `posts/${postId}`;
    try {
      const snapshot = await getDoc(doc(db, 'posts', postId));
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as Post;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  deletePost: async (postId: string) => {
    const path = `posts/${postId}`;
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  getReplies: async (postId: string): Promise<Reply[]> => {
    const path = `posts/${postId}/replies`;
    try {
      const q = query(collection(db, 'posts', postId, 'replies'), orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reply));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  subscribeToReplies: (postId: string, callback: (replies: Reply[]) => void) => {
    const path = `posts/${postId}/replies`;
    const q = query(collection(db, 'posts', postId, 'replies'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reply)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  createReply: async (postId: string, content: string) => {
    const path = `posts/${postId}/replies`;
    if (!auth.currentUser) throw new Error("Auth required");
    try {
      return await addDoc(collection(db, 'posts', postId, 'replies'), {
        postId,
        content,
        authorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // --- Showcase Methods ---
  getShowcaseItems: async (): Promise<ShowcaseItem[]> => {
    const path = 'showcase';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShowcaseItem));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  subscribeToShowcase: (callback: (items: ShowcaseItem[]) => void) => {
    const path = 'showcase';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShowcaseItem)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  createShowcaseItem: async (itemData: Omit<ShowcaseItem, 'id' | 'authorId' | 'createdAt'>) => {
    const path = 'showcase';
    if (!auth.currentUser) throw new Error("Auth required");
    try {
      return await addDoc(collection(db, path), {
        ...itemData,
        authorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
};

export interface ShowcaseItem {
  id: string;
  type: 'video' | 'report';
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  authorId: string;
  createdAt: any;
}
