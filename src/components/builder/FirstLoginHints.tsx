// FirstLoginHints — Onboarding overlay for new users

import { useState, useEffect } from 'react';
import { X, MessageSquare, Smartphone, Wand2, FolderOpen, Zap, ChevronRight, Lightbulb } from 'lucide-react';
import { useUserId } from './BuilderLayout';
import { supabase } from '@/lib/supabase/client';

interface HintStep { icon: React.ReactNode; title: string; description: string; }

const HINTS: HintStep[] = [
  { icon: <MessageSquare size={20} className="text-lotus-400" />, title: 'Chat to Build', description: 'Describe the app you want in the chat. Try "Build me a fitness app with a dark dashboard and green theme." The AI will create it instantly.' },
  { icon: <Smartphone size={20} className="text-lotus-400" />, title: 'Live Preview', description: 'Your app preview updates in real-time as you chat. Switch between iPhone, iPad, and Desktop views to see how it looks.' },
  { icon: <Wand2 size={20} className="text-lotus-400" />, title: 'Skills & Agents', description: 'Open the Skills panel to access pre-built templates and agents. Import custom skills from markdown files.' },
  { icon: <FolderOpen size={20} className="text-lotus-400" />, title: 'Projects', description: 'Switch between projects, rename them, or start fresh. Everything auto-saves to the cloud.' },
  { icon: <Zap size={20} className="text-lotus-400" />, title: 'Export Anywhere', description: 'Export your app as React + Tailwind code, push to GitHub, or deploy via Expo to iOS and Android.' },
];

const QUICK_TIPS = [
  'Try: "Build me a fitness app with dark green theme and bottom navigation"',
  'Try: "Build me an e-commerce app with product grid and shopping cart"',
  'Try: "Build me a social media app with feed, likes, and comments"',
  'Tip: You can upload images to use in your app',
  'Tip: Toggle the Skills panel for quick-start templates',
  'Tip: Switch device views using the top-right controls',
];

export function FirstLoginHints() {
  const userId = useUserId();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    if (!userId) return;
    supabase.from('user_profiles').select('has_seen_hints').eq('id', userId).single().then(({ data }) => {
      if (!data?.has_seen_hints) setShow(true); else setDismissed(true);
    });
    const interval = setInterval(() => setCurrentTip(prev => (prev + 1) % QUICK_TIPS.length), 8000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleDismiss = async () => {
    setShow(false); setDismissed(true);
    if (userId) await supabase.from('user_profiles').update({ has_seen_hints: true }).eq('id', userId);
  };

  if (dismissed && !show) {
    return (
      <div className="hidden lg:block fixed bottom-20 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a1a]/90 border border-white/5 backdrop-blur-sm">
          <Lightbulb size={12} className="text-lotus-400/60 shrink-0" />
          <p className="text-[10px] text-white/30 max-w-xs truncate">{QUICK_TIPS[currentTip]}</p>
          <button onClick={() => setDismissed(false)} className="text-[10px] text-lotus-400/40 hover:text-lotus-400 ml-1">Show hints</button>
        </div>
      </div>
    );
  }

  if (!show) return null;
  const hint = HINTS[step];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-[#141414] border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded overflow-hidden"><img src="/logo-lotus.png" alt="LOTUS" className="w-full h-full object-cover" /></div><span className="text-xs font-semibold text-white/70">Welcome to LOTUS</span></div>
          <button onClick={handleDismiss} className="p-1 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/50 transition-all"><X size={14} /></button>
        </div>
        <div className="px-5 py-6">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-lotus-400/10 flex items-center justify-center">{hint.icon}</div><h3 className="text-sm font-semibold text-white/80">{hint.title}</h3></div>
          <p className="text-xs text-white/40 leading-relaxed">{hint.description}</p>
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {HINTS.map((_, i) => <button key={i} onClick={() => setStep(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? 'bg-lotus-400 w-4' : 'bg-white/10 hover:bg-white/20'}`} />)}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDismiss} className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white/30 hover:text-white/50 hover:bg-white/5 transition-all">Skip</button>
            <button onClick={() => step < HINTS.length - 1 ? setStep(step + 1) : handleDismiss()} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium bg-lotus-400/10 text-lotus-400 hover:bg-lotus-400/20 transition-all">
              {step === HINTS.length - 1 ? 'Get Started' : 'Next'}<ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
