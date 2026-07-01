/**
 * BuilderLayout - Phase 1 Redesign
 * New architecture: 5 workspaces with persistent bottom navigation
 * Workspaces: Home, Projects, Builder, Preview, Menu
 */

import { useEffect } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import type { AuthUser } from '@/lib/supabase/auth';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { ErrorBoundary } from './ErrorBoundary';
import { HomeWorkspace } from '../workspaces/HomeWorkspace';
import { ProjectsWorkspace } from '../workspaces/ProjectsWorkspace';
import { BuilderWorkspace } from '../workspaces/BuilderWorkspace';
import { PreviewWorkspace } from '../workspaces/PreviewWorkspace';
import { MenuWorkspace } from '../workspaces/MenuWorkspace';
import { Home, FolderOpen, MessageSquare, Eye, Menu } from 'lucide-react';

interface BuilderLayoutProps {
  user: AuthUser;
}

type WorkspaceType = 'home' | 'projects' | 'builder' | 'preview' | 'menu';

interface NavItem {
  id: WorkspaceType;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: <Home size={20} /> },
  { id: 'projects', label: 'Projects', icon: <FolderOpen size={20} /> },
  { id: 'builder', label: 'Builder', icon: <MessageSquare size={20} /> },
  { id: 'preview', label: 'Preview', icon: <Eye size={20} /> },
  { id: 'menu', label: 'Menu', icon: <Menu size={20} /> },
];

export function BuilderLayout({ user }: BuilderLayoutProps) {
  const {
    loadProjects,
    setCurrentUser,
    mobileTab,
    setMobileTab,
  } = useBuilderStore();

  // Initialize user and load projects
  useEffect(() => {
    setCurrentUser(user);
    loadProjects();
  }, [user, loadProjects, setCurrentUser]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Could add escape handlers here
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const currentWorkspace = mobileTab as WorkspaceType;

  return (
    <div className="flex h-screen max-w-full flex-col overflow-hidden bg-[#000000] text-white">
      <PWAInstallPrompt />

      {/* Workspace Container */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ErrorBoundary>
          {currentWorkspace === 'home' && <HomeWorkspace />}
          {currentWorkspace === 'projects' && <ProjectsWorkspace />}
          {currentWorkspace === 'builder' && <BuilderWorkspace />}
          {currentWorkspace === 'preview' && <PreviewWorkspace />}
          {currentWorkspace === 'menu' && <MenuWorkspace />}
        </ErrorBoundary>
      </div>

      {/* Persistent Bottom Navigation */}
      <nav className="shrink-0 border-t border-white/10 bg-[#05070d] flex items-center justify-around h-[72px] px-2 safe-area-inset-bottom">
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={currentWorkspace === item.id}
            onClick={() => setMobileTab(item.id as typeof mobileTab)}
          />
        ))}
      </nav>
    </div>
  );
}

function NavButton(
  {
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all ${
        active
          ? 'text-lotus-400 bg-lotus-400/10 border border-lotus-400/20'
          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
      }`}
      aria-label={item.label}
      title={item.label}
    >
      {item.icon}
      <span className="text-[10px] font-semibold uppercase tracking-wide">{item.label}</span>
    </button>
  );
}

export function useUserId(): string | undefined {
  return useBuilderStore((state) => state._currentUser?.id);
}
