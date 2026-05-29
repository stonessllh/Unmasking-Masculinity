import { useState, useEffect } from 'react';
import { Send, User, MessageCircle, Clock, Trash2, ChevronRight } from 'lucide-react';
import { firestoreService, Post, Reply } from '../lib/firestoreService';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '../lib/LanguageContext';

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    const unsubscribe = firestoreService.subscribeToPosts(setPosts);
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setError(language === 'zh' ? '请填写主题与讨论内容！' : 'Please fill in both subject and content.');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    try {
      const docRef = await firestoreService.createPost({
        title: newTitle,
        content: newContent,
      });
      
      const newlyCreatedPost: Post = {
        id: docRef?.id || '',
        title: newTitle,
        content: newContent,
        authorId: auth.currentUser?.uid || '',
        createdAt: null,
      };

      setNewTitle('');
      setNewContent('');
      setSelectedPost(newlyCreatedPost);
      
      // On mobile, scroll to the details after posting
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error(err);
      let friendlyError = language === 'zh' ? '发布失败，请重试' : 'Failed to post. Please try again.';
      try {
        if (err.message && err.message.startsWith('{')) {
          const parsed = JSON.parse(err.message);
          friendlyError = parsed.error || friendlyError;
        } else {
          friendlyError = err.message || friendlyError;
        }
      } catch {
        friendlyError = err.message || friendlyError;
      }
      setError(friendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (post: Post) => {
    if (window.confirm(t('forum.delete_confirm'))) {
      try {
        await firestoreService.deletePost(post.id);
        if (selectedPost?.id === post.id) setSelectedPost(null);
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-24">
      {/* Left Column: Post list */}
      <div className="lg:col-span-2 space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white">{t('forum.title')}</h2>
          <p className="text-slate-400 font-light">{t('forum.subtitle')}</p>
        </div>

        {/* Create Post Form */}
        <form onSubmit={handleSubmit} className="glass p-8 space-y-4 border-indigo-500/20">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm italic">
              {error}
            </div>
          )}
          <input 
            type="text" 
            placeholder={t('forum.post_subject_placeholder')}
            className="w-full text-lg font-bold bg-transparent border-none focus:ring-0 placeholder-slate-600 text-white"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea 
            placeholder={t('forum.post_content_placeholder')}
            rows={4}
            className="w-full bg-transparent border-none focus:ring-0 resize-none font-light placeholder-slate-600 text-slate-300"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <span className="text-xs text-slate-500 flex items-center gap-1 italic">
              <User className="w-3 h-3" /> {language === 'zh' ? '已开启匿名保护' : 'Anonymous Identity Protected'}
            </span>
            <button 
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-full flex items-center gap-2 text-sm hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] active:scale-95 cursor-pointer"
            >
              {isSubmitting ? t('forum.post_submitting') : t('forum.post_submit')} <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Post Feed */}
        <div className="space-y-6">
          <h3 className="text-xs uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2">
            <Clock className="w-4 h-4" /> {language === 'zh' ? '最新探讨探讨' : 'Latest Discussions'}
          </h3>
          {posts.length === 0 ? (
            <div className="glass p-12 text-center border-dashed">
              <p className="text-slate-500 italic">{t('forum.post_placeholder_no_items')}</p>
            </div>
          ) : (
            posts.map((post) => (
              <div 
                key={post.id} 
                className={`p-8 glass transition-all cursor-pointer group rounded-3xl ${
                  selectedPost?.id === post.id ? 'border-indigo-500/50 ring-1 ring-indigo-500/30 bg-white/5' : 'hover:border-white/20'
                }`}
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{post.title}</h3>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono uppercase tracking-widest">
                    <Clock className="w-3 h-3" /> 
                    {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                  </div>
                </div>
                <p className="text-slate-400 line-clamp-3 font-light mb-6 whitespace-pre-wrap">
                  {post.content}
                </p>
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-widest text-indigo-400">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> {language === 'zh' ? '查阅详请与回复' : 'View Details & Reply'}
                  </span>
                  {auth.currentUser?.uid === post.authorId && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost(post);
                      }}
                      className="text-red-400 hover:text-red-500 p-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Interaction detailing */}
      <div className="space-y-8">
        {selectedPost ? (
           <PostDetails post={selectedPost} onClose={() => setSelectedPost(null)} />
        ) : (
          <div className="sticky top-28 glass p-12 flex flex-col items-center justify-center text-center space-y-4 h-[60vh] border-dashed rounded-3xl">
            <MessageCircle className="w-12 h-12 text-slate-700" />
            <h4 className="font-bold text-white">{language === 'zh' ? '选择一个探讨话题' : 'Select a discussion'}</h4>
            <p className="text-sm text-slate-500 font-light">{language === 'zh' ? '点击左侧的探讨话题，开始回复对话、给予共情。' : 'Click a post on the left to see replies or join the conversation.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PostDetails({ post, onClose }: { post: Post, onClose: () => void }) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language, t } = useLanguage();

  useEffect(() => {
    const unsubscribe = firestoreService.subscribeToReplies(post.id, setReplies);
    return () => unsubscribe();
  }, [post.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    setIsSubmitting(true);
    try {
      await firestoreService.createReply(post.id, newReply);
      setNewReply('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sticky top-28 glass shadow-2xl flex flex-col h-[70vh] border-indigo-500/10 rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
        <h3 className="font-bold truncate pr-4 text-white text-base">{post.title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-500 hover:text-white cursor-pointer">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <div className="p-4 glass-dark rounded-2xl">
          <p className="text-sm text-slate-300 font-light whitespace-pre-wrap leading-relaxed">{post.content}</p>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{t('forum.replies')}</h4>
          {replies.length === 0 ? (
            <p className="text-xs text-slate-600 italic text-center py-8 font-light">{t('forum.no_replies')}</p>
          ) : (
            replies.map((reply) => (
              <div key={reply.id} className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <User className="w-3 h-3" /> {language === 'zh' ? '匿名用户' : 'Anonymous'}
                  <span className="font-sans opacity-30">•</span>
                  {reply.createdAt ? formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                </div>
                <div className="p-4 glass-dark text-sm leading-relaxed text-slate-300 rounded-2xl">
                  {reply.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 border-t border-white/5 bg-black/20">
        <div className="relative">
          <input 
            type="text" 
            placeholder={t('forum.write_reply')}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 pr-12 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
          />
          <button 
            disabled={isSubmitting || !newReply.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full disabled:opacity-30 transition-all hover:scale-105 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
