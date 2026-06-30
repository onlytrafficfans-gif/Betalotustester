/**
 * FirstLoginHints — contextual tips for new users
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Sparkles, X, ChevronRight, Keyboard, MessageSquare, Zap, Wand2 } from 'lucide-react';

const QUICK_TIPS = [
  { icon: MessageSquare, text: 'Describe your app in the chat panel' },
  { icon: Wand2, text: 'LOTUS will generate the app structure and UI' },
  { icon: Zap, text: 'Preview updates live as you chat' },
  { icon: Keyboard, text: 'Press Ctrl+\\ to toggle the sidebar' },
];

interface FirstLoginHintsProps {
  userId?: string;
}

export function FirstLoginHints({ userId }: FirstLoginHintsProps) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Check if user has dismissed hints
    const checkDismissed = async () => {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('has_seen_hints')
          .eq('id', userId)
          .single();

        if (!data?.has_seen_hints) {
          setShow(true);
        } else {
          setDismissed(true);
        }
      } catch {
        // If profile doesn't exist yet, show hints
        setShow(true);
      }
    };

    checkDismissed();

    // Rotate tips every 8 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % QUICK_TIPS.length);
    }, 8000);

    return () => clearInterval(tipInterval);
  }, [userId]);

  const handleDismiss = async () => {
    setShow(false);
    setDismissed(true);
    if (userId) {
      try {
        await supabase
          .from('user_profiles')
          .update({ has_seen_hints: true })
          .eq('id', userId);
      } catch {
        // Silently fail — hints dismissal is not critical
      }
    }
  };

  if (!show || dismissed) return null;

  const TipIcon = QUICK_TIPS[currentTip].icon;

  return (
    <div className="fixed top-9 right-4 z-[65] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="w-[280px] bg-[#0f0f0f] border border-white/[0.06] rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-[11px] font-medium text-white/60">Quick Tips</span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded hover:bg-white/5 text-white/30 hover:text-white/50 transition-all"
          >
            <X size={12} />
          </button>
        </div>

        {/* Tip content */}
        <div className="px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <TipIcon size={14} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[12px] text-white/70 leading-relaxed">
                {QUICK_TIPS[currentTip].text}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {QUICK_TIPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTip(i)}
                    className={`h-1 rounded-full transition-all ${
                      i === currentTip ? 'w-4 bg-amber-400' : 'w-1 bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-white/[0.04] flex items-center justify-between">
          <span className="text-[10px] text-white/20">
            {currentTip + 1} / {QUICK_TIPS.length}
          </span>
          <button
            onClick={() => setCurrentTip((prev) => (prev + 1) % QUICK_TIPS.length)}
            className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/50 transition-all"
          >
            Next <ChevronRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
