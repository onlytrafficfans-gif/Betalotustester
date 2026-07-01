/**
 * BuilderLayout
 * Desktop: collapsible dock | chat workspace | collapsible live preview
 * Mobile: one active tab at a time with a single bottom navigation bar
 */
import { useEffect, useCallback } from 'react';
import {
  Bot,
  Bell,
  ChevronDown,
  CircleHelp,
  Copy,
  Database,
  CreditCard,
  FolderOpen,
  Flame,
  Github,
  LayoutGrid,
  Lock,
  Mail,
  MessageSquare,
  Palette,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Plug,
  RotateCcw,
  Search,
  Settings,
  Smartphone,
  Sparkles,
  Type,
  UserCircle,
  X,
  Zap,
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
    <div className="h-full max-w-full overflow-hidden bg-[#05070d] text-white">
      <PWAInstallPrompt />
      <FirstLoginHints userId={user.id} />

      <div className="hidden h-full min-w-0 flex-col md:flex">
        <DesktopTopBar user={user} onOpenOverlay={openOverlay} />

        <div className="flex min-h-0 flex-1 gap-2 p-2">
          {isSidebarOpen ? (
            <aside className="h-full w-[250px] shrink-0 overflow-hidden rounded-md border border-white/[0.08] bg-[#09111d] shadow-[0_0_0_1px_rgba(0,0,0,0.3)]">
              <div className="relative h-full">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="absolute right-3 top-3 z-20 rounded-lg p-1.5 text-white/35 transition hover:bg-white/5 hover:text-white/75"
                  aria-label="Close workspace"
                >
                  <X size={15} />
                </button>
                {sidebarView === 'projects' ? <ProjectSidebar /> : <SettingsPanel />}
              </div>
            </aside>
          ) : (
            <DesktopDock
              sidebarView={sidebarView}
              isOpen={isSidebarOpen}
              activeOverlay={activeOverlay}
              onOpenDock={openDock}
              onOpenOverlay={openOverlay}
              onToggleDock={() => setSidebarOpen(true)}
            />
          )}

          {activeOverlay === 'skills' && (
            <section className="hidden h-full w-[250px] shrink-0 overflow-hidden rounded-md border border-white/[0.08] bg-[#08101b] xl:block">
              <SkillsAgentsPanel onClose={closeOverlay} />
            </section>
          )}

          <main className="min-w-[380px] flex-1 overflow-hidden rounded-md border border-white/[0.08] bg-[#08101b]">
            <ErrorBoundary>
              <ChatPanel />
            </ErrorBoundary>
          </main>

          {showPreview ? (
            <section className="h-full min-w-[350px] max-w-[520px] resize-x overflow-auto rounded-md border border-white/[0.08] bg-[#08101b] lg:w-[360px] xl:w-[420px]">
              <LivePreview schema={schema} onSchemaChange={handleSchemaChange} />
            </section>
          ) : (
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex h-full w-11 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-[#08101b] text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35 transition hover:bg-white/[0.03] hover:text-lotus-300"
              aria-label="Open preview"
            >
              <span className="-rotate-90 whitespace-nowrap">Preview</span>
            </button>
          )}
        </div>
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
          <div className="relative min-h-0 w-full overflow-hidden">
            {(showMobileProjects || showMobileSettings) && (
              <button
                type="button"
                onClick={() => useBuilderStore.getState().setMobileTab('chat')}
                className="absolute right-4 top-[calc(14px+env(safe-area-inset-top))] z-30 rounded-full border border-white/10 bg-white/[0.05] p-2.5 text-white/70"
                aria-label="Close panel"
              >
                <X size={18} />
              </button>
            )}
            {showMobileProjects && <ProjectSidebar />}
            {showMobileSettings && <SettingsPanel />}
            {showMobileSkills && <SkillsAgentsPanel onClose={() => useBuilderStore.getState().setMobileTab('chat')} mobile />}
          </div>
        </section>
      </div>

      {activeOverlay === 'skills' && (
        <div className="fixed inset-0 z-50 hidden bg-black/45 backdrop-blur-sm md:block xl:hidden" onMouseDown={closeOverlay}>
          <div className="absolute bottom-3 left-3 top-3 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-white/10 bg-[#08101b] shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <SkillsAgentsPanel onClose={closeOverlay} />
          </div>
        </div>
      )}
      <BuilderOverlayPanel activeOverlay={activeOverlay} onClose={closeOverlay} />
      <MobileTabs />
    </div>
  );
}

function DesktopTopBar({
  user,
  onOpenOverlay,
}: {
  user: AuthUser;
  onOpenOverlay: (overlay: Exclude<BuilderOverlay, null>) => void;
}) {
  return (
    <header className="flex h-[58px] shrink-0 items-center border-b border-white/[0.07] bg-[#090d16] px-5">
      <div className="flex min-w-[360px] items-center gap-3">
        <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-lotus-400/10">
          <span className="text-[10px] font-bold text-lotus-300">L</span>
          <img src="/logo-lotus.png" alt="LOTUS" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex items-baseline gap-5">
          <span className="text-lg font-semibold tracking-wide text-white/90">LOTUS</span>
          <span className="text-sm text-white/45">App Builder</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="flex rounded-xl border border-white/[0.07] bg-white/[0.025] p-1">
          <button type="button" className="rounded-lg bg-lotus-400/10 px-4 py-2 text-xs font-semibold text-lotus-300">Preview</button>
          <button type="button" className="rounded-lg px-4 py-2 text-xs font-semibold text-white/40 transition hover:text-white/70">Code</button>
        </div>
        <button type="button" className="ml-3 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-white/55 transition hover:text-white/80">
          V23 <ChevronDown size={13} />
        </button>
      </div>

      <div className="flex min-w-[360px] items-center justify-end gap-1.5">
        <button type="button" onClick={() => onOpenOverlay('quickActions')} className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs font-semibold text-white/65 transition hover:text-lotus-300">
          <Zap size={14} /> Update
        </button>
        <TopIconButton label="New" icon={<Plus size={16} />} />
        <TopIconButton label="Copy" icon={<Copy size={16} />} />
        <div className="mx-2 h-6 w-px bg-white/[0.07]" />
        <TopIconButton label="Undo" icon={<RotateCcw size={16} />} />
        <TopIconButton label="Help" icon={<CircleHelp size={16} />} />
        <TopIconButton label="Alerts" icon={<Bell size={16} />} />
        <button type="button" className="ml-2 flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-white/65 transition hover:bg-white/[0.04]">
          <UserCircle size={18} />
          <span className="max-w-[110px] truncate">{user.name || user.email?.split('@')[0] || 'Builder'}</span>
          <ChevronDown size={13} />
        </button>
      </div>
    </header>
  );
}

function TopIconButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      title={label}
      className="rounded-xl p-2 text-white/35 transition hover:bg-white/[0.04] hover:text-white/75"
      aria-label={label}
    >
      {icon}
    </button>
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
    <nav className="flex h-full w-[58px] shrink-0 flex-col items-center gap-2 rounded-md border border-white/[0.08] bg-[#09111d] px-2 py-3">
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
  if (!activeOverlay || activeOverlay === 'skills') return null;

  const title = activeOverlay === 'integrations' ? 'Integrations' : 'Quick Actions';

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className="absolute left-1/2 top-1/2 flex max-h-[calc(100dvh-24px)] w-[min(520px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1421] shadow-2xl"
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
    <div className="p-5">
      <p className="mb-4 text-sm text-white/42">Connect services to extend your app's capabilities.</p>
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025]">
        <IntegrationRow icon={<Github size={22} />} name="GitHub" text="Import & export repositories" state="arrow" />
        <IntegrationRow icon={<Database size={22} />} name="Supabase" text="Database & Auth" state="check" accent />
        <IntegrationRow icon={<CreditCard size={22} />} name="Stripe" text="Payments" state="toggle" />
        <IntegrationRow icon={<Flame size={22} />} name="Firebase" text="Backend & Analytics" state="toggle" />
        <IntegrationRow icon={<Mail size={22} />} name="SendGrid" text="Email" state="toggle" />
        <button type="button" className="flex w-full items-center gap-3 px-4 py-4 text-left text-sm text-white/55 transition hover:bg-white/[0.03] hover:text-white/80">
          <Plus size={16} className="text-white/35" />
          Add integration
        </button>
      </div>
    </div>
  );
}

function IntegrationRow({ icon, name, text, state, accent }: { icon: React.ReactNode; name: string; text: string; state: 'arrow' | 'check' | 'toggle'; accent?: boolean }) {
  return (
    <button type="button" className="flex w-full items-center gap-4 border-b border-white/[0.06] px-4 py-3 text-left last:border-b-0 transition hover:bg-white/[0.03]">
      <span className={accent ? 'text-lotus-300' : 'text-white/70'}>{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-white/78">{name}</div>
        <div className="text-xs text-white/38">{text}</div>
      </div>
      {state === 'arrow' && <span className="text-lg text-white/35">›</span>}
      {state === 'check' && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lotus-400 text-xs font-bold text-[#04110f]">✓</span>}
      {state === 'toggle' && <span className="flex h-6 w-10 items-center rounded-full bg-white/10 p-1"><span className="h-4 w-4 rounded-full bg-white/65" /></span>}
    </button>
  );
}

export function useUserId(): string | undefined {
  return useBuilderStore((state) => state._currentUser?.id);
}
