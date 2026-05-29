import { Layout, MessageSquare, Shield, Info, Sparkles, LogOut, User } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useLanguage } from '../lib/LanguageContext';

interface NavbarProps {
  currentView: string;
  setView: (view: any) => void;
}

export default function Navbar({ currentView, setView }: NavbarProps) {
  const user = auth.currentUser;
  const isGuest = !user;
  const { t } = useLanguage();

  const navItems = [
    { id: 'landing', label: t('nav.home'), icon: Info, alwaysShow: true },
    { id: 'showcase', label: t('nav.showcase'), icon: Layout, alwaysShow: false },
    { id: 'dashboard', label: t('nav.forum'), icon: MessageSquare, alwaysShow: false },
    { id: 'assistant', label: t('nav.assistant'), icon: Sparkles, alwaysShow: false },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="glass px-6 sm:px-8 h-16 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setView('landing')}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-transform group-hover:scale-110"></div>
          <span className="hidden lg:block text-white font-bold tracking-tight">Breaking<span className="text-indigo-400">.</span>Silence</span>
        </div>
        
        <div className="flex gap-4 sm:gap-6 lg:gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`relative py-1 text-xs sm:text-sm font-medium transition-colors hover:text-white flex flex-col sm:flex-row items-center gap-1 sm:gap-2 ${
                currentView === item.id ? 'text-indigo-400' : 'text-slate-400'
              }`}
            >
              <item.icon className={`w-4 h-4 ${currentView === item.id ? 'opacity-100' : 'opacity-50'}`} />
              <span>{item.label}</span>
              {currentView === item.id && (
                <motion.span 
                  layoutId="nav-glow"
                  className="absolute -top-1 left-0 w-full h-[1px] bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)]" 
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

