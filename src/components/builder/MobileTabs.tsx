// MobileTabs — Bottom tab bar for tablet and mobile
// Switches between Chat, Preview, and Skills views

import { useBuilderStore } from '@/state/builderStore';
import { MessageSquare, Smartphone, Wand2, FolderOpen, Settings } from 'lucide-react';

const TABS = [
  { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
  { id: 'preview' as const, label: 'Preview', icon: Smartphone },
  { id: 'skills' as const, label: 'Skills', icon: Wand2 },
  { id: 'projects' as const, label: 'Projects', icon: FolderOpen },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export function MobileTabs() {
  const { mobileTab, setMobileTab } = useBuilderStore();

  return (
    <div className="lg:hidden shrink-0 border-t border-white/5 bg-[#0a0a0a] z-50">
      <div className="flex items-center justify-around px-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = mobileTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-all ${
                isActive ? 'text-lotus-400' : 'text-white/20 hover:text-white/40'
              }`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
