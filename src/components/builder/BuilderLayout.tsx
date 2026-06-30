/**
 * BuilderLayout
 * Desktop: sidebar (250px) | chat panel (flex-1 min 350px) | preview (400px)
 * Mobile: bottom tabs switch between chat/preview, settings as overlay
 */
import { useEffect, useCallback } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import type { AuthUser } from '@/lib/supabase/auth';
import { ProjectSidebar } from './ProjectSidebar';
import { ChatPanel } from './ChatPanel';
import { LivePreview } from './LivePreview';
import { MobileTabs } from './MobileTabs';
import { FloatingToolbar } from './FloatingToolbar';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { ErrorBoundary } from './ErrorBoundary';
import { SettingsPanel } from './SettingsPanel';
import { SkillsAgentsPanel } from './SkillsAgentsPanel';
import { FirstLoginHints } from './FirstLoginHints';

interface BuilderLayoutProps {
  user: AuthUser;
}

export function BuilderLayout({ user }: BuilderLayoutProps) {
  const {
    loadProjects,
    setCurrentUser,
    mobileTab,
    sidebarView,
    isSidebarOpen,
    showSkillsPanel,
    schema,
    setSidebarOpen,
  } = useBuilderStore();

  // Set current user first, then load projects — order matters for provider refresh
  useEffect(() => {
    setCurrentUser(user);
    loadProjects();
  }, [user, loadProjects, setCurrentUser]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarOpen(!isSidebarOpen);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isSidebarOpen, setSidebarOpen]);

  const handleSchemaChange = useCallback(
    (newSchema: typeof schema) => {
      useBuilderStore.getState().pushSchemaHistory(newSchema);
    },
    []
  );

  const showChat = mobileTab === 'chat';
  const showPreviewPane = mobileTab === 'preview';
  const showMobileProjects = mobileTab === 'projects';
  const showMobileSettings = mobileTab === 'settings';

  return (
    <div className="h-full flex bg-[#050505] overflow-hidden">
      <PWAInstallPrompt />
      <FirstLoginHints userId={user.id} />

      {/* Left sidebar */}
      <aside
        className={`hidden md:block shrink-0 h-full border-r border-white/[0.04] transition-all duration-200 ${
          isSidebarOpen ? 'w-[250px] opacity-100' : 'w-0 opacity-0 overflow-hidden'
        }`}
      >
        {sidebarView === 'projects' ? (
          <ProjectSidebar />
        ) : (
          <SettingsPanel />
        )}
      </aside>

      {/* Chat panel */}
      <main
        className={`flex-1 min-w-0 flex flex-col border-r border-white/[0.04] ${
          showChat ? 'flex' : 'hidden md:flex'
        }`}
      >
        <div className="flex-1 min-h-0 overflow-hidden">
          <ErrorBoundary>
            <ChatPanel />
          </ErrorBoundary>
        </div>
        <MobileTabs />
      </main>

      {/* Mobile project/settings panels */}
      <section
        className={`flex-1 min-w-0 bg-[#0a0a0a] ${
          showMobileProjects || showMobileSettings ? 'flex md:hidden' : 'hidden'
        }`}
      >
        <div className="flex min-h-0 w-full flex-col">
          <div className="flex-1 min-h-0 overflow-hidden">
            {showMobileProjects ? <ProjectSidebar /> : <SettingsPanel />}
          </div>
          <MobileTabs />
        </div>
      </section>

      {/* Preview */}
      <section
        className={`shrink-0 bg-[#080808] transition-all duration-200 ${
          showPreviewPane ? 'flex' : 'hidden md:flex'
        } ${
          useBuilderStore.getState().showPreview
            ? 'w-full md:w-[420px] lg:w-[450px] xl:w-[480px]'
            : 'w-0 overflow-hidden'
        }`}
      >
        <div className="w-full h-full overflow-auto">
          <LivePreview schema={schema} onSchemaChange={handleSchemaChange} />
        </div>
      </section>

      {/* Skills panel overlay */}
      {showSkillsPanel && <SkillsAgentsPanel />}

      {/* Floating toolbar */}
      <FloatingToolbar />
    </div>
  );
}

export function useUserId(): string | undefined {
  return useBuilderStore((state) => state._currentUser?.id);
}
