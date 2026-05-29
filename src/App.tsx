/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Showcase from './components/Showcase';
import Dashboard from './components/Dashboard';
import Assistant from './components/Assistant';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './lib/LanguageContext';

export default function App() {
  const [view, setView] = useState<'landing' | 'showcase' | 'dashboard' | 'assistant'>('landing');
  const [user, setUser] = useState(auth.currentUser);

  const [authError, setAuthError] = useState<string | null>(null);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen mesh-bg text-slate-200 selection:bg-indigo-500 selection:text-white relative">
      {/* Floating Language Switcher */}
      <div className="absolute top-8 right-8 z-[200]">
        <button
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider glass hover:bg-white/10 active:scale-95 transition-all text-white border border-white/10 rounded-full flex items-center gap-2 shadow-lg shadow-black/25 cursor-pointer"
        >
          <span>🌐</span>
          <span>{language === 'en' ? '中文 (ZH)' : 'English (EN)'}</span>
        </button>
      </div>

      {authError && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4">
          <div className="glass bg-red-500/10 border-red-500/20 p-4 text-center text-sm text-red-400">
            {authError}
          </div>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-160px)]">
        <AnimatePresence mode="wait">
          {(!user || view === 'landing') && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <LandingPage setView={setView} />
            </motion.div>
          )}

          {user && view === 'showcase' && (
            <motion.div
              key="showcase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Showcase />
            </motion.div>
          )}

          {user && view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Dashboard />
            </motion.div>
          )}

          {user && view === 'assistant' && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Assistant />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Navbar currentView={view} setView={setView} />

      <div className="w-64 h-2 bg-indigo-500/20 blur-3xl mx-auto -mt-12 mb-12 rounded-full" />

      <footer className="py-12 pb-32 text-center text-sm uppercase tracking-widest opacity-60">
        © 2026 Unmasking Masculinity Project
      </footer>
    </div>
  );
}
