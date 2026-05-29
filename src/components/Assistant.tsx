import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Loader2, Info } from 'lucide-react';
import { geminiService } from '../lib/geminiService';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../lib/LanguageContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Assistant() {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { 
        id: 'welcome', 
        role: 'assistant', 
        content: t('assistant.welcome_msg')
      }
    ]);
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await geminiService.analyzeProblem(input);
      const assistantMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response || (language === 'zh' ? '抱歉，我现在无法回答。' : 'Sorry, I cannot answer right now.')
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: language === 'zh' 
          ? `抱歉，与倾听模块的连接遇到了些问题。😔 (错误: ${error.message || '连接失败'})。请稍候再试一下！`
          : `I'm sorry, I'm having trouble connecting to my brain right now. 😔 (Error: ${error.message || 'Connection failed'}). Please try again in a moment!` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 flex flex-col h-[75vh]">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold flex items-center gap-2 text-white">
            {t('assistant.title')} <Sparkles className="w-8 h-8 text-indigo-400" />
          </h2>
          <p className="text-slate-500 text-sm italic font-light">{t('assistant.subtitle')}</p>
        </div>
        <div className="group relative">
          <Info className="w-5 h-5 text-slate-700 cursor-help" />
          <div className="absolute right-0 top-8 w-64 p-4 glass-dark rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none text-xs leading-relaxed text-slate-400 italic">
            {t('assistant.disclaimer')}
          </div>
        </div>
      </div>

      <div className="flex-1 glass overflow-hidden flex flex-col border-indigo-500/10 rounded-3xl">
        {/* Chat window */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth scrollbar-hide"
        >
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                m.role === 'assistant' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'glass-dark text-white'
              }`}>
                {m.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] p-6 rounded-3xl ${
                m.role === 'assistant' 
                  ? 'glass-dark text-slate-200 border-indigo-500/20' 
                  : 'bg-indigo-900/40 text-white border-white/5 border'
              }`}>
                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:font-light">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="glass-dark p-6 rounded-3xl flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-sm italic opacity-40 font-mono text-slate-400">
                  {language === 'zh' ? '正在深思熟虑中...' : 'Thinking...'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-6 border-t border-white/5 bg-black/20">
          <div className="relative group">
            <input 
              type="text" 
              placeholder={t('assistant.input_placeholder')}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-8 pr-16 focus:ring-1 focus:ring-indigo-500/50 text-white text-lg transition-all placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
