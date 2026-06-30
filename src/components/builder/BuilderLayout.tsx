// BuilderLayout — Clean workspace. Every panel is user-controlled.
// Desktop: floating toolbar toggles for Projects, Skills, Settings
// Nothing opens unless the user clicks it. Preview is always visible.

import { useEffect, createContext, useContext } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import { ChatPanel } from './ChatPanel';
import { LivePreview } from './LivePreview';
import { ProjectSidebar } from './ProjectSidebar';
import { SettingsPanel } from './SettingsPanel';
import { SkillsAgentsPanel } from './SkillsAgentsPanel';
import { MobileTabs } from './MobileTabs';
import { FloatingToolbar } from './FloatingToolbar';
import { FirstLoginHints } from './FirstLoginHints';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { ErrorBoundary } from './ErrorBoundary';

export const UserContext = createContext<string>('');
export const useUserId = () => useContext(UserContext);

interface BuilderLayoutProps {
  user: { id: string; email: string; name?: string; avatar?: string };
}

export function BuilderLayout({ user }: BuilderLayoutProps) {
  const {
    loadProjects,
    mobileTab,
    sidebarView,
    isSidebarOpen,
    showSkillsPanel,
    schema,
    setSidebarOpen,
  } = useBuilderStore();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    useBuilderStore.setState({ _currentUser: user });
  }, [user]);

  const renderSidebarContent = () => {
    switch (sidebarView) {
      case 'projects': return <ProjectSidebar />;
      case 'settings': return <SettingsPanel />;
      default: return null;
    }
  };

  return (
    <UserContext.Provider value={user.id}>
      <ErrorBoundary>
        <div className="h-screen w-screen flex flex-col bg-[#050505] text-[#e5e5e5] overflow-hidden lotus-no-overflow">
          {/* Minimal Top Bar */}
          <header className="flex items-center justify-between h-11 px-4 border-b border-white/5 bg-[#0a0a0a] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center">
                <img src="/logo-lotus.png" alt="LOTUS" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-semibold text-white/80 tracking-wide">LOTUS</span>
              <span className="text-[10px] text-white/25 ml-1 hidden sm:inline">Builder</span>
            </div>
            <PreviewControls />
          </header>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden relative">
            {isSidebarOpen && sidebarView && (
              <>
                <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
                <div className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-80 max-w-[85vw] lg:w-72 xl:w-80 border-r border-white/5 bg-[#0a0a0a] flex flex-col`}>
                  <div className="flex-1 overflow-y-auto">{renderSidebarContent()}</div>
                </div>
              </>
            )}

            {/* Desktop */}
            <div className="hidden lg:flex flex-1 min-w-0">
              <div className="flex-1 min-w-0 border-r border-white/5">
                <ChatPanel />
              </div>
              {showSkillsPanel && (
                <div className="w-72 xl:w-80 border-r border-white/5 bg-[#0a0a0a] flex flex-col">
                  <SkillsAgentsPanel />
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col bg-[#0a0a0a]">
                <div className="flex-1 flex items-center justify-center p-4 xl:p-6 overflow-auto">
                  {schema && <LivePreview schema={schema} />}
                </div>
              </div>
            </div>

            {/* Mobile */}
            <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
              {mobileTab === 'chat' && <ChatPanel />}
              {mobileTab === 'preview' && (
                <div className="flex-1 flex items-center justify-center bg-[#0a0a0a] overflow-auto">
                  {schema && <LivePreview schema={schema} />}
                </div>
              )}
              {mobileTab === 'skills' && (
                <div className="flex-1 overflow-y-auto bg-[#050505]"><SkillsAgentsPanel /></div>
              )}
              {mobileTab === 'projects' && (
                <div className="flex-1 overflow-y-auto bg-[#050505]"><ProjectSidebar /></div>
              )}
              {mobileTab === 'settings' && (
                <div className="flex-1 overflow-y-auto bg-[#050505]"><SettingsPanel /></div>
              )}
            </div>
          </div>

          <MobileTabs />
          <FloatingToolbar />
          <FirstLoginHints />
          <PWAInstallPrompt />
        </div>
      </ErrorBoundary>
    </UserContext.Provider>
  );
}

// Preview Controls
import { Smartphone, Tablet, Monitor } from 'lucide-react';

function PreviewControls() {
  const { previewDevice, setPreviewDevice } = useBuilderStore();
  const devices = [
    { id: 'phone' as const, icon: <Smartphone size={13} />, label: 'Phone' },
    { id: 'tablet' as const, icon: <Tablet size={13} />, label: 'Tablet' },
    { id: 'desktop' as const, icon: <Monitor size={13} />, label: 'Desktop' },
  ];
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/5 border border-white/5">
      {devices.map((d) => (
        <button
          key={d.id}
          onClick={() => setPreviewDevice(d.id)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
            previewDevice === d.id ? 'bg-lotus-400/15 text-lotus-400' : 'text-white/30 hover:text-white/50 hover:bg-white/5'
          }`}
          title={d.label}
        >
          {d.icon}
        </button>
      ))}
    </div>
  );
}
