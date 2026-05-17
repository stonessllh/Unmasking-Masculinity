import { ArrowRight, MessageCircle, PlayCircle, FileText, LogIn } from 'lucide-react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';

export default function LandingPage({ setView }: { setView: (v: any) => void }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const isGuest = !auth.currentUser || auth.currentUser.isAnonymous;

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden rounded-[3rem] glass">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-20 grayscale brightness-50"
            alt="Masculinity context"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 text-center space-y-8 px-4">
          <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-white flex flex-col items-center justify-center gap-4">
            <span>Unmasking</span>
            <span className="relative inline-block text-indigo-400">
              <span className="absolute -left-8 md:-left-12 -top-4 text-6xl md:text-8xl opacity-40 font-serif">“</span>
              <span className="italic">Masculinity</span>
              <span className="absolute -right-8 md:-right-12 -top-4 text-6xl md:text-8xl opacity-40 font-serif">”</span>
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 font-light leading-relaxed">
            Exploring how traditional social norms create emotional expression challenges for male students. 
            We break the silence and build a supportive community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            {isGuest ? (
              <button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="px-8 py-4 bg-white text-indigo-900 rounded-full flex items-center justify-center gap-2 hover:bg-slate-200 shadow-xl transition-all active:scale-95 font-bold"
              >
                <LogIn className="w-5 h-5" />
                {isLoggingIn ? 'Signing in...' : 'Sign in with Google to Enter'}
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setView('showcase')}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-full flex items-center justify-center gap-2 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all active:scale-95"
                >
                  View Project <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setView('dashboard')}
                  className="px-8 py-4 glass text-white rounded-full flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                >
                  Enter Community <MessageCircle className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4 p-8 glass group hover:border-indigo-500/30 transition-colors">
          <div className="w-12 h-12 glass-dark rounded-2xl flex items-center justify-center text-indigo-400">
            <PlayCircle className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white">Video Records</h3>
          <p className="text-slate-400 leading-relaxed font-light">
            Revealing the inner world of male students through depth interviews and documentary footage.
          </p>
        </div>
        <div className="space-y-4 p-8 glass group hover:border-indigo-500/30 transition-colors">
          <div className="w-12 h-12 glass-dark rounded-2xl flex items-center justify-center text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white">Research Reports</h3>
          <p className="text-slate-400 leading-relaxed font-light">
            Sociological analysis exploring how social expectations subtly suppress emotional expression.
          </p>
        </div>
        <div className="space-y-4 p-8 glass group hover:border-indigo-500/30 transition-colors">
          <div className="w-12 h-12 glass-dark rounded-2xl flex items-center justify-center text-indigo-400">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white">Anonymous Support</h3>
          <p className="text-slate-400 leading-relaxed font-light">
            A safe, anonymous environment where every student can speak bravely and help each other.
          </p>
        </div>
      </section>

      {/* Quote Section */}
      <section className="glass py-24 px-8 rounded-[3rem] text-center space-y-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <blockquote className="text-3xl md:text-5xl font-light italic max-w-4xl mx-auto leading-tight text-white">
          "Admitting vulnerability is not a weakness, but the beginning of courage."
        </blockquote>
        <div className="w-12 h-[1px] bg-indigo-500/50 mx-auto shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
        <cite className="block font-medium tracking-[0.5em] text-xs text-indigo-400 uppercase">
          Project Team Thesis
        </cite>
      </section>
    </div>
  );
}
