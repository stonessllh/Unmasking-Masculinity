import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.showcase': 'Showcase',
    'nav.forum': 'Forum Discussion',
    'nav.assistant': 'AI Counselor',
    'nav.logout': 'Sign Out',
    'nav.login': 'Sign In',

    // Landing
    'landing.title': 'Unmasking Masculinity',
    'landing.subtitle': 'A safe, supportive space for male students to explore emotions, break down traditional gender stereotypes, and exchange insights.',
    'landing.enter_google': 'Sign in with Google',
    'landing.enter_anonymous': 'Enter as Anonymous Guest',
    'landing.features': 'CORE SPACES',
    'landing.view_stats': 'Enter Platform To View',

    // Showcase
    'showcase.title': 'Project Showcase',
    'showcase.subtitle': 'Insights from the community. Share your documentaries, research reports, or personal logs to help others understand the complexity of masculinity today.',
    'showcase.add_btn': 'Share Your Work',
    'showcase.placeholder_no_items': 'No community projects shared yet. Be the first to contribute!',
    'showcase.more_coming': 'More records being organized by the community...',
    'showcase.modal_title': 'Share Project',
    'showcase.modal_file_label': 'Select File from Computer',
    'showcase.modal_file_desc_1': 'Drag & drop or click to choose file',
    'showcase.modal_file_desc_2': 'Due to backend optimizations, we support large videos or documents up to 100MB!',
    'showcase.modal_type_video': 'Video',
    'showcase.modal_type_report': 'Report',
    'showcase.modal_title_label': 'Project Title',
    'showcase.modal_title_placeholder': 'e.g. Masculinity in 2024 Documentary',
    'showcase.modal_desc_label': 'Project Description',
    'showcase.modal_desc_placeholder': 'Give a brief summary of your work...',
    'showcase.modal_submit': 'Publish to Showcase',
    'showcase.modal_publishing': 'Publishing...',
    'showcase.watch_now': 'Watch Now',
    'showcase.access_file': 'Access File',
    'showcase.download': 'Download',
    'showcase.file_too_large': 'File size exceeds limit (Max 100MB).',
    'showcase.lightbox_secure': 'Secure Document Asset',
    'showcase.lightbox_secure_desc': 'This is a secure local report or document. Click the button below to download and read it natively.',

    // Forum (Dashboard)
    'forum.title': 'Forum Discussion',
    'forum.subtitle': 'A judgment-free dialogue sphere. Share your stories, dilemmas, or reflections on traditional masculinity expectations.',
    'forum.new_post': 'New Discussion',
    'forum.post_placeholder_no_items': 'No stories shared yet. Break the silence and start a real conversation.',
    'forum.post_form_label': 'Start a New Discussion',
    'forum.post_subject_label': 'Subject',
    'forum.post_subject_placeholder': 'How do you handle pressure to be "strong"?',
    'forum.post_content_label': 'Content',
    'forum.post_content_placeholder': 'Share your experience, feelings, or questions here...',
    'forum.post_submit': 'Post to Forum',
    'forum.post_submitting': 'Posting...',
    'forum.replies': 'Replies',
    'forum.no_replies': 'No replies yet. Be the first to share an empathetic reply.',
    'forum.write_reply': 'Write an empathetic reply...',
    'forum.submit_reply': 'Send Reply',
    'forum.submitting_reply': 'Sending...',
    'forum.delete_confirm': 'Are you sure you want to delete this?',

    // AI Counselor (Assistant)
    'assistant.title': 'Masculinity AI Support',
    'assistant.subtitle': 'Speak freely. An empathetic, non-judgmental conversational space designed to help you process emotional distress and pressure under social expectations.',
    'assistant.disclaimer': 'Note: This AI counselor is a peer-support tool, not a professional medical/psychological therapy service. Try to stay safe and seek official help if in crisis.',
    'assistant.input_placeholder': 'I feel pressured to hide my emotions...',
    'assistant.input_submit': 'Consult AI',
    'assistant.input_consulting': 'Consulting...',
    'assistant.history_title': 'Counseling Sessions',
    'assistant.history_new': 'New Session',
    'assistant.history_empty': 'No counseling runs in this session yet.',
    'assistant.welcome_msg': 'Hello. How can I support you today? Feel free to express any emotional weights, relationship challenges, or stress regarding social expectations.',
    
    // Auth
    'auth.error_signin': 'SignIn is required to view/interact with this page.',
  },
  zh: {
    // Navbar
    'nav.home': '主页',
    'nav.showcase': '成果展示',
    'nav.forum': '论坛讨论',
    'nav.assistant': 'AI 心理咨询',
    'nav.logout': '登出账号',
    'nav.login': '登录',

    // Landing
    'landing.title': '探寻·男子气概',
    'landing.subtitle': '一个安全、理解、充满支持的专属空间。帮助男学生探索情感世界，打破传统“硬汉”性别刻板印象，共同交流与成长。',
    'landing.enter_google': '谷歌账号登录',
    'landing.enter_anonymous': '免密访客登陆',
    'landing.features': '核心板块',
    'landing.view_stats': '登录平台以查看',

    // Showcase
    'showcase.title': '项目成果展示',
    'showcase.subtitle': '来自社区的洞察与感悟。分享你的视频纪录片、研究报告或个人日志，帮助他人理解当今男子气概的复杂多样性。',
    'showcase.add_btn': '分享你的成果',
    'showcase.placeholder_no_items': '目前还没有社区项目。成为第一个分享精彩成果的人吧！',
    'showcase.more_coming': '更多成果正在由社区整理中...',
    'showcase.modal_title': '分享项目',
    'showcase.modal_file_label': '从电脑选择本地文件/视频',
    'showcase.modal_file_desc_1': '拖拽或点击此处选择文件',
    'showcase.modal_file_desc_2': '已全面升级！由于采用后端存储，现已完美支持高达 100MB 的视频与文档上传，不再占用本地数据库。',
    'showcase.modal_type_video': '视频视频',
    'showcase.modal_type_report': '报告文档',
    'showcase.modal_title_label': '项目名称',
    'showcase.modal_title_placeholder': '例如：当代男子气概的演变纪录片',
    'showcase.modal_desc_label': '内容简介',
    'showcase.modal_desc_placeholder': '简单介绍一下你的项目背景与核心内容...',
    'showcase.modal_submit': '发布到成果室',
    'showcase.modal_publishing': '正在发布...',
    'showcase.watch_now': '立即播放',
    'showcase.access_file': '查看文件',
    'showcase.download': '本地下载',
    'showcase.file_too_large': '文件大小超出限制，最高支持 100MB。',
    'showcase.lightbox_secure': '安全本地资源',
    'showcase.lightbox_secure_desc': '这是一份由社区成员上传的安全本地研究文件。点击下方按钮即可一键下载并阅读原文。',

    // Forum (Dashboard)
    'forum.title': '论坛交流空间',
    'forum.subtitle': '无评判的温暖倾听室。分享你的故事、困境与对于“男子气概”传统期望的真切感悟。',
    'forum.new_post': '发起新探讨',
    'forum.post_placeholder_no_items': '目前还没有故事被分享。打破沉默，发起一场真实而温和的对话吧。',
    'forum.post_form_label': '发起新话题',
    'forum.post_subject_label': '主题',
    'forum.post_subject_placeholder': '你是如何处理“必须坚强”的社会压力的？',
    'forum.post_content_label': '内容',
    'forum.post_content_placeholder': '在这里书写你的经历、困惑或真心反思...',
    'forum.post_submit': '发布到论坛',
    'forum.post_submitting': '发布中...',
    'forum.replies': '回复列表',
    'forum.no_replies': '暂无回复。成为第一个给予感同身受回复的人吧！',
    'forum.write_reply': '写下一句充满共情的回复...',
    'forum.submit_reply': '发送回复',
    'forum.submitting_reply': '发送中...',
    'forum.delete_confirm': '确定要删除这条内容吗？',

    // AI Counselor (Assistant)
    'assistant.title': '男性情绪 AI 倾听室',
    'assistant.subtitle': '畅所欲言。专为男学生打造的温情对话空间，帮你在面对期待、压抑与焦虑时提供温柔支持与共情引导。',
    'assistant.disclaimer': '注意：本 AI 心理助手由模型驱动，属于同辈倾听与反思工具，不能代替正规的专业医学/心理临床咨询服务。如有紧急心理危机，请寻求专业机构援助。',
    'assistant.input_placeholder': '我常常觉得必须掩饰自己的脆弱，好累...',
    'assistant.input_submit': '向 AI 吐露心声',
    'assistant.input_consulting': '倾听分析中...',
    'assistant.history_title': '历史倾听会话',
    'assistant.history_new': '新建倾听会话',
    'assistant.history_empty': '本次还没有历史倾听。',
    'assistant.welcome_msg': '你好，很高兴在这里伴你前行。今天让你烦恼、感到压抑或困惑的是关于硬撑的压力，人际冲突，还是其他社会的期望呢？尽管和我说吧，我会倾听并伴在你的身旁。',
    
    // Auth
    'auth.error_signin': '请登录后再进行此操作。',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang');
    return (saved === 'zh' || saved === 'en') ? saved : 'zh';
  });

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
