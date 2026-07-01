// ProjectSidebar — Project list, rename, create, delete

import { useState } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import { Plus, Trash2, Pencil, Check, X, FolderOpen, Clock, Sparkles, Blocks, Workflow, Palette, Plug, Settings, Server, KeyRound, Users, Github, Database, CreditCard, Cloud } from 'lucide-react';

export function ProjectSidebar() {
  const { projects, project, switchProject, createNewProject, deleteProject, renameProject, setActiveOverlay, setSidebarView } = useBuilderStore();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  return (
    <div className="flex h-full flex-col bg-[#09111d]">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-lotus-400/10">
          <span className="text-[10px] font-bold text-lotus-300">L</span>
          <img src="/logo-lotus.png" alt="LOTUS" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-wide text-white/90">LOTUS</h2>
          <p className="text-xs text-white/40">Workspace</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarSection title="Workspace">
          <div className="px-4 py-1.5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
              <FolderOpen size={15} className="text-white/45" />
              Projects
            </div>
            <div className="space-y-1">
              {projects.length === 0 && (
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-3 text-xs text-white/25">No projects yet</div>
              )}
              {projects.map((p) => {
                const isActive = project?.id === p.id;
                const date = new Date(p.updatedAt).toLocaleDateString();
                return (
                  <div key={p.id} className={`group flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${isActive ? 'bg-lotus-400/10 text-lotus-300' : 'text-white/55 hover:bg-white/[0.03]'}`}>
                    {renamingId === p.id ? (
                      <div className="flex flex-1 items-center gap-1">
                        <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/75 focus:border-lotus-400/30 focus:outline-none" autoFocus />
                        <button onClick={() => { renameProject(p.id, renameValue); setRenamingId(null); }} className="rounded p-1 text-lotus-400 hover:bg-lotus-400/10"><Check size={12} /></button>
                        <button onClick={() => setRenamingId(null)} className="rounded p-1 text-white/30 hover:bg-white/5"><X size={12} /></button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => switchProject(p.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                          <span className={`h-2 w-2 shrink-0 rounded-sm ${isActive ? 'bg-lotus-400' : 'bg-white/15'}`} />
                          <div className="min-w-0">
                            <div className="truncate text-xs font-medium">{p.name}</div>
                            <div className="flex items-center gap-1 text-[10px] text-white/20"><Clock size={8} />{date}</div>
                          </div>
                        </button>
                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => { setRenamingId(p.id); setRenameValue(p.name); }} className="rounded p-1 text-white/20 hover:bg-white/5 hover:text-white/50"><Pencil size={10} /></button>
                          <button onClick={() => deleteProject(p.id)} className="rounded p-1 text-white/20 hover:bg-red-500/10 hover:text-red-400"><Trash2 size={10} /></button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={() => createNewProject()} className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/45 transition hover:bg-white/[0.03] hover:text-white/75">
              <Plus size={13} /> New Project
            </button>
          </div>
        </SidebarSection>

        <SidebarSection title="Build">
          <SidebarButton icon={<Sparkles size={14} />} label="Skills / Agents" badge="5" onClick={() => setActiveOverlay('skills')} />
          <SidebarButton icon={<Blocks size={14} />} label="UI Components" />
          <SidebarButton icon={<Workflow size={14} />} label="Workflows" />
          <SidebarButton icon={<Palette size={14} />} label="Themes" />
          <SidebarButton icon={<Plug size={14} />} label="Integrations" onClick={() => setActiveOverlay('integrations')} />
        </SidebarSection>

        <SidebarSection title="Configure">
          <SidebarButton icon={<Settings size={14} />} label="Settings" onClick={() => setSidebarView('settings')} />
          <SidebarButton icon={<Server size={14} />} label="Environments" />
          <SidebarButton icon={<KeyRound size={14} />} label="API Keys" onClick={() => setSidebarView('settings')} />
          <SidebarButton icon={<Users size={14} />} label="Team" />
        </SidebarSection>

        <SidebarSection title="Integrations">
          <SidebarButton icon={<Github size={14} />} label="GitHub" sublabel="Import & export repos" onClick={() => setActiveOverlay('integrations')} />
          <SidebarButton icon={<Database size={14} />} label="Supabase" sublabel="Database & Auth" active />
          <SidebarButton icon={<CreditCard size={14} />} label="Stripe" sublabel="Payments" toggle />
          <SidebarButton icon={<Cloud size={14} />} label="Firebase" sublabel="Backend & Analytics" toggle />
          <SidebarButton icon={<Plus size={14} />} label="Add integration" onClick={() => setActiveOverlay('integrations')} />
        </SidebarSection>
      </div>
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-white/[0.06] py-3">
      <div className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/38">{title}</div>
      {children}
    </section>
  );
}

function SidebarButton({
  icon,
  label,
  sublabel,
  badge,
  active,
  toggle,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  badge?: string;
  active?: boolean;
  toggle?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-1.5 text-left text-sm text-white/58 transition hover:bg-white/[0.03] hover:text-white/82"
    >
      <span className={active ? 'text-lotus-300' : 'text-white/40'}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{label}</span>
        {sublabel && <span className="block truncate text-[10px] text-white/32">{sublabel}</span>}
      </span>
      {badge && <span className="rounded-full bg-lotus-400/15 px-2 py-0.5 text-[10px] font-semibold text-lotus-300">{badge}</span>}
      {active && <Check size={13} className="text-lotus-300" />}
      {toggle && <span className="h-4 w-7 rounded-full bg-white/10"><span className="block h-4 w-4 rounded-full bg-white/45" /></span>}
    </button>
  );
}
