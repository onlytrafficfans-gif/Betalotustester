// DeployPanel — App Store / Google Play deployment checklist

import { useState } from 'react';
import { X, Rocket, Check, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface DeployPanelProps { onClose: () => void; }

const CHECKLIST = [
  { platform: 'iOS', items: [
    { label: 'Apple Developer Account ($99/yr)', required: true },
    { label: 'App Icon (1024x1024)', required: true },
    { label: 'App Store Screenshots', required: true },
    { label: 'Privacy Policy URL', required: true },
    { label: 'App Description & Keywords', required: true },
    { label: 'TestFlight Beta Testing', required: false },
    { label: 'App Review Compliance', required: true },
  ]},
  { platform: 'Android', items: [
    { label: 'Google Play Developer ($25 one-time)', required: true },
    { label: 'App Icon (512x512)', required: true },
    { label: 'Feature Graphic (1024x500)', required: true },
    { label: 'App Store Screenshots', required: true },
    { label: 'Privacy Policy URL', required: true },
    { label: 'Content Rating Questionnaire', required: true },
    { label: 'Internal Testing Track', required: false },
  ]},
];

export function DeployPanel({ onClose }: DeployPanelProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string>('iOS');

  const toggleCheck = (key: string) => {
    const next = new Set(checked);
    if (next.has(key)) next.delete(key); else next.add(key);
    setChecked(next);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#141414] border border-white/5 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Rocket size={16} className="text-lotus-400" />
            <h3 className="text-sm font-semibold text-white/80">Deploy Checklist</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-white/30"><X size={14} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {CHECKLIST.map((section) => {
            const isOpen = expanded === section.platform;
            const done = section.items.filter(i => checked.has(`${section.platform}-${i.label}`)).length;
            return (
              <div key={section.platform} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? '' : section.platform)} className="w-full flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/70">{section.platform}</span>
                    <span className="text-[10px] text-white/20">{done}/{section.items.length}</span>
                  </div>
                  {isOpen ? <ChevronUp size={14} className="text-white/20" /> : <ChevronDown size={14} className="text-white/20" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-3 space-y-2">
                    {section.items.map((item) => {
                      const key = `${section.platform}-${item.label}`;
                      const isChecked = checked.has(key);
                      return (
                        <button key={item.label} onClick={() => toggleCheck(key)} className="w-full flex items-center gap-2 text-left">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-lotus-400 border-lotus-400' : 'border-white/10'}`}>
                            {isChecked && <Check size={10} className="text-black" />}
                          </div>
                          <span className={`text-xs ${isChecked ? 'text-white/30 line-through' : 'text-white/50'}`}>{item.label}</span>
                          {item.required && <span className="text-[9px] text-red-400/40 px-1 rounded bg-red-500/5">required</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <div className="text-center">
            <a href="https://docs.expo.dev/deploy/app-stores/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-white/20 hover:text-lotus-400/60 transition-colors">
              <ExternalLink size={10} /> Expo App Store docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
