/**
 * BuilderLayout
 * Desktop: collapsible dock | chat workspace | collapsible live preview
 * Mobile: one active tab at a time with a single bottom navigation bar
 */
import { useEffect, useCallback } from 'react';
import {
  Bot,
  Database,
  FolderOpen,
  Github,
  LayoutGrid,
  Lock,
  MessageSquare,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Plug,
  Search,
  Settings,
  Smartphone,
  Sparkles,
  Type,
  UserCircle,
  X,
} from 'lucide-react';
import { useBuilderStore } from '@/state/builderStore';
import type { AuthUser } from '@/lib/supabase/auth';
import type { BuilderOverlay, SidebarView } from '@/state/builderStore';
import { ProjectSidebar } from './ProjectSidebar';
import { ChatPanel } from './ChatPanel';
import { LivePreview } from './LivePreview';
import { MobileTabs } from './MobileTabs';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { ErrorBoundary } from './ErrorBoundary';
import { SettingsPanel } from './SettingsPanel';
import { SkillsAgentsPanel } from './SkillsAgentsPanel';
import { FirstLoginHints } from './FirstLoginHints';
import { GitHubPanel } from './GitHubPanel';

interface BuilderLayoutProps {
  user: AuthUser;
}

const QUICK_ACTIONS = [
  { icon: <Sparkles size={14} />, label: 'Build an agent', prompt: 'Build me an AI agent app with a chat interface, agent avatar, message bubbles, typing indicator, and a clean modern design. Include a home screen and a chat screen.' },
  { icon: <Bot size={14} />, label: 'Add chat interface', prompt: 'Add a chat screen with message bubbles, a text input at the bottom, and a send button. Style it like a modern messaging app.' },
  { icon: <MessageSquare size={14} />, label: 'Add AI assistant', prompt: 'Add an AI assistant screen with a bot avatar, welcome message, suggested prompts, and a chat input area.' },
  { icon: <Lock size={14} />, label: 'Add login screen', prompt: 'Add a login screen with email and password fields, a sign in button, and a "Forgot password?" link. Style it clean and modern.' },
  { icon: <UserCircle size={14} />, label: 'Add profile page', prompt: 'Add a profile page with a circular avatar, user name, bio text, and a list of settings options with icons.' },
  { icon: <Smartphone size={14} />, label: 'Add onboarding', prompt: 'Add an onboarding flow with 3 welcome screens that users can swipe through. Each screen should have an illustration area, a title, description, and a "Next" button.' },
  { icon: <Palette size={14} />, label: 'Dark theme', prompt: 'Change the theme to dark mode with deep blacks (#0a0a0a), subtle gray surfaces (#1a1a1a), and white text. Update all screens.' },
  { icon: <LayoutGrid size={14} />, label: 'Add dashboard', prompt: 'Add a dashboard screen with 4 stat cards at the top showing key metrics, followed by a recent activity list and a chart.' },
  { icon: <Type size={14} />, label: 'Add search', prompt: 'Add a search screen with a search bar at the top and a list of results below with icons and subtitles.' },
  { icon: <Settings size={14} />, label: 'Add settings', prompt: 'Add a settings screen with toggle switches for notifications, dark mode, and privacy. Include section headers and dividers.' },
  { icon: <Database size={14} />, label: 'Add data list', prompt: 'Add a screen with a scrollable list of items. Each item should have an icon, title, subtitle, and a chevron arrow on the right.' },
];

export function BuilderLayout({ user }: BuilderLayoutProps) {
  const {
    loadProjects,
    setCurrentUser,
    mobileTab,
    sidebarView,
    isSidebarOpen,
    activeOverlay,
    schema,
    showPreview,
    setSidebarView,
    setSidebarOpen,
    setActiveOverlay,
    closeOverlay,
    setShowPreview,
  } = useBuilderStore();

  useEffect(() => {
    setCurrentUser(user);
    loadProjects();
  }, [user, loadProjects, setCurrentUser]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarOpen(!isSidebarOpen);
      }

      if (e.key === 'Escape') {
        closeOverlay();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeOverlay, isSidebarOpen, setSidebarOpen]);

  const handleSchemaChange = useCallback(
    (newSchema: typeof schema) => {
      useBuilderStore.getState().pushSchemaHistory(newSchema);
    },
    []
  );

  const openDock = useCallback((view: SidebarView) => {
    closeOverlay();
    setSidebarView(view);
    setSidebarOpen(true);
  }, [closeOverlay, setSidebarOpen, setSidebarView]);

  const openOverlay = useCallback((overlay: Exclude<BuilderOverlay, null>) => {
    setActiveOverlay(activeOverlay === overlay ? null : overlay);
  }, [activeOverlay, setActiveOverlay]);

  const showChat = mobileTab === 'chat';
  const showPreviewPane = mobileTab === 'preview';
  const showMobileProjects = mobileTab === 'projects';
  const showMobileSettings = mobileTab === 'settings';
  const showMobileSkills = mobileTab === 'skills';

  return (
    <div className="h-full max-w-full overflow-hidden bg-[#050505] text-white">
      <PWAInstallPrompt />
      <FirstLoginHints userId={user.id} />

      <div className="hidden h-full min-w-0 md:flex">
        <DesktopDock
          sidebarView={sidebarView}
          isOpen={isSidebarOpen}
          activeOverlay={activeOverlay}
          onOpenDock={openDock}
          onOpenOverlay={openOverlay}
          onToggleDock={() => setSidebarOpen(!isSidebarOpen)}
        />

        <aside
          className={`h-full shrink-0 overflow-hidden border-r border-white/[0.05] bg-[#080808] transition-[width,opacity] duration-200 ${
            isSidebarOpen ? 'w-[260px] opacity-100' : 'w-0 opacity-0'
          }`}
        >
          <div className="relative h-full min-w-[260px]">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-3 z-20 rounded-lg border border-white/5 bg-black/30 p-1.5 text-white/35 transition hover:bg-white/5 hover:text-white/75"
              aria-label="Close left panel"
            >
              <PanelLeftClose size={15} />
            </button>
            {sidebarView === 'projects' ? <ProjectSidebar /> : <SettingsPanel />}
          </div>
        </aside>

        <main className="flex min-w-[360px] flex-1 flex-col border-r border-white/[0.04]">
          <ErrorBoundary>
            <ChatPanel />
          </ErrorBoundary>
        </main>

        {showPreview ? (
          <section className="h-full min-w-[360px] max-w-[720px] resize-x overflow-auto bg-[#080808] lg:w-[470px] xl:w-[520px]">
            <LivePreview schema={schema} onSchemaChange={handleSchemaChange} />
          </section>
        ) : (
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex h-full w-12 shrink-0 items-center justify-center border-l border-white/[0.05] bg-[#080808] text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35 transition hover:bg-white/[0.03] hover:text-lotus-300"
            aria-label="Open preview"
          >
            <span className="-rotate-90 whitespace-nowrap">Preview</span>
          </button>
        )}
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col md:hidden">
        <main className={`${showChat ? 'flex' : 'hidden'} min-h-0 flex-1 flex-col pb-[calc(72px+env(safe-area-inset-bottom))]`}>
          <ErrorBoundary>
            <ChatPanel />
          </ErrorBoundary>
        </main>

        <section className={`${showPreviewPane ? 'flex' : 'hidden'} min-h-0 flex-1 bg-[#080808] pb-[calc(72px+env(safe-area-inset-bottom))]`}>
          <div className="h-full w-full overflow-auto">
            <LivePreview schema={schema} onSchemaChange={handleSchemaChange} />
          </div>
        </section>

        <section className={`${showMobileProjects || showMobileSettings || showMobileSkills ? 'flex' : 'hidden'} min-h-0 flex-1 bg-[#0a0a0a] pb-[calc(72px+env(safe-area-inset-bottom))]`}>
          <div className="min-h-0 w-full overflow-hidden">
            {showMobileProjects && <ProjectSidebar />}
            {showMobileSettings && <SettingsPanel />}
            {showMobileSkills && <SkillsAgentsPanel />}
          </div>
        </section>
      </div>

      <BuilderOverlayPanel activeOverlay={activeOverlay} onClose={closeOverlay} />
      <MobileTabs />
    </div>
  );
}

function DesktopDock({
  sidebarView,
  isOpen,
  activeOverlay,
  onOpenDock,
  onOpenOverlay,
  onToggleDock,
}: {
  sidebarView: SidebarView;
  isOpen: boolean;
  activeOverlay: BuilderOverlay;
  onOpenDock: (view: SidebarView) => void;
  onOpenOverlay: (overlay: Exclude<BuilderOverlay, null>) => void;
  onToggleDock: () => void;
}) {
  return (
    <nav className="flex h-full w-[58px] shrink-0 flex-col items-center gap-2 border-r border-white/[0.05] bg-[#060606] px-2 py-3">
      <button
        type="button"
        onClick={onToggleDock}
        className="mb-2 rounded-xl border border-white/5 bg-white/[0.03] p-2 text-white/40 transition hover:text-white/75"
        aria-label={isOpen ? 'Collapse dock' : 'Expand dock'}
      >
        {isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
      </button>
      <DockButton icon={<FolderOpen size={18} />} label="Projects" active={isOpen && sidebarView === 'projects'} onClick={() => onOpenDock('projects')} />
      <DockButton icon={<Sparkles size={18} />} label="Skills" active={activeOverlay === 'skills'} onClick={() => onOpenOverlay('skills')} />
      <DockButton icon={<Settings size={18} />} label="Settings" active={isOpen && sidebarView === 'settings'} onClick={() => onOpenDock('settings')} />
      <DockButton icon={<Plug size={18} />} label="Integrations" active={activeOverlay === 'integrations'} onClick={() => onOpenOverlay('integrations')} />
      <DockButton icon={<Search size={18} />} label="Quick Actions" active={activeOverlay === 'quickActions'} onClick={() => onOpenOverlay('quickActions')} />
    </nav>
  );
}

function DockButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
        active
          ? 'border-lotus-400/25 bg-lotus-400/10 text-lotus-300'
          : 'border-transparent text-white/35 hover:border-white/5 hover:bg-white/[0.04] hover:text-white/75'
      }`}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function BuilderOverlayPanel({ activeOverlay, onClose }: { activeOverlay: BuilderOverlay; onClose: () => void }) {
  if (!activeOverlay) return null;

  const title = activeOverlay === 'skills' ? 'Skills' : activeOverlay === 'integrations' ? 'Integrations' : 'Quick Actions';
  const isDrawer = activeOverlay === 'skills';

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className={`absolute flex max-h-[calc(100dvh-24px)] overflow-hidden border border-white/10 bg-[#0b0b0b] shadow-2xl ${
          isDrawer
            ? 'bottom-3 right-3 top-3 w-[min(390px,calc(100vw-24px))] rounded-2xl'
            : 'left-1/2 top-1/2 w-[min(720px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 rounded-2xl'
        }`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex min-h-0 w-full flex-col">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/35 transition hover:bg-white/5 hover:text-white/80"
              aria-label={`Close ${title}`}
            >
              <X size={16} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            {activeOverlay === 'skills' && <SkillsAgentsPanel />}
            {activeOverlay === 'integrations' && <IntegrationsPanel />}
            {activeOverlay === 'quickActions' && <QuickActionsPanel onClose={onClose} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionsPanel({ onClose }: { onClose: () => void }) {
  const sendMessage = useBuilderStore((state) => state.sendMessage);

  return (
    <div className="grid gap-2 p-4 sm:grid-cols-2">
      {QUICK_ACTIONS.map((action) => (
        <button
          type="button"
          key={action.label}
          onClick={() => {
            onClose();
            void sendMessage(action.prompt);
          }}
          className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-left text-sm text-white/55 transition hover:border-lotus-400/20 hover:bg-lotus-400/[0.06] hover:text-white"
        >
          <span className="text-lotus-300/75">{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}

function IntegrationsPanel() {
  return (
    <div className="space-y-4 p-4">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/70">
          <Github size={16} className="text-lotus-300/75" />
          GitHub
        </div>
        <GitHubPanel />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <IntegrationStub icon={<Database size={15} />} name="Supabase" text="Connected through app configuration" active />
        <IntegrationStub icon={<Plug size={15} />} name="Stripe" text="Available when configured" />
      </div>
    </div>
  );
}

function IntegrationStub({ icon, name, text, active }: { icon: React.ReactNode; name: string; text: string; active?: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-white/65">
        <span className={active ? 'text-lotus-300/75' : 'text-white/30'}>{icon}</span>
        {name}
      </div>
      <p className="mt-1 text-xs text-white/30">{text}</p>
    </div>
  );
}

export function useUserId(): string | undefined {
  return useBuilderStore((state) => state._currentUser?.id);
}
