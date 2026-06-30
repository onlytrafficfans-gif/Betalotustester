// FloatingToolbar — Floating toggle buttons for panel visibility
// Desktop only. Users control which panels are visible.

import { useBuilderStore } from '@/state/builderStore';
import { FolderOpen, Wand2, Settings, MessageSquare } from 'lucide-react';

export function FloatingToolbar() {
  const { sidebarView, isSidebarOpen, showSkillsPanel, toggleSidebar, setSidebarOpen, toggleSkillsPanel } = useBuilderStore();
  const projectsActive = isSidebarOpen && sidebarView === 'projects';
  const settingsActive = isSidebarOpen && sidebarView === 'settings';

  const toggleProjects = () => { if (projectsActive) setSidebarOpen(false); else toggleSidebar('projects'); };
  const toggleSettings = () => { if (settingsActive) setSidebarOpen(false); else toggleSidebar('settings'); };

  return (
    <div className="hidden lg:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40 items-center gap-1 px-2 py-1.5 rounded-2xl bg-[#141414]/95 border border-white/5 shadow-2xl backdrop-blur-sm">
      <ToolbarButton icon={<FolderOpen size={15} />} label="Projects" active={projectsActive} onClick={toggleProjects} />
      <div className="w-px h-4 bg-white/5 mx-0.5" />
      <ToolbarButton icon={<MessageSquare size={15} />} label="Chat" active={true} onClick={() => {}} disabled />
      <ToolbarButton icon={<Wand2 size={15} />} label={showSkillsPanel ? 'Hide Skills' : 'Skills'} active={showSkillsPanel} onClick={toggleSkillsPanel} />
      <div className="w-px h-4 bg-white/5 mx-0.5" />
      <ToolbarButton icon={<Settings size={15} />} label="Settings" active={settingsActive} onClick={toggleSettings} />
    </div>
  );
}

function ToolbarButton({ icon, label, active, onClick, disabled }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={label}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all ${
        disabled ? 'text-white/15 cursor-default' : active ? 'bg-lotus-400/10 text-lotus-400' : 'text-white/30 hover:text-white/60 hover:bg-white/5'
      }`}>
      {icon}<span className="hidden xl:inline">{label}</span>
    </button>
  );
}
