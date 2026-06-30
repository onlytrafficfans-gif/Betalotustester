// ProjectSidebar — Project list, rename, create, delete

import { useState } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import { Plus, Trash2, Pencil, Check, X, FolderOpen, Clock } from 'lucide-react';

export function ProjectSidebar() {
  const { projects, project, switchProject, createNewProject, deleteProject, renameProject } = useBuilderStore();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <div className="shrink-0 px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Projects</h2>
        <button onClick={() => createNewProject()} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-lotus-400 transition-all">
          <Plus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {projects.length === 0 && (
          <div className="text-center py-8"><p className="text-xs text-white/20">No projects yet</p></div>
        )}
        {projects.map((p) => {
          const isActive = project?.id === p.id;
          const date = new Date(p.updatedAt).toLocaleDateString();
          return (
            <div key={p.id} className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-lotus-400/10 border border-lotus-400/20' : 'hover:bg-white/[0.02] border border-transparent'}`}>
              {renamingId === p.id ? (
                <div className="flex-1 flex items-center gap-1">
                  <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="flex-1 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-xs text-white/70 focus:outline-none focus:border-lotus-400/30" autoFocus />
                  <button onClick={() => { renameProject(p.id, renameValue); setRenamingId(null); }} className="p-1 rounded text-lotus-400 hover:bg-lotus-400/10"><Check size={12} /></button>
                  <button onClick={() => setRenamingId(null)} className="p-1 rounded text-white/30 hover:bg-white/5"><X size={12} /></button>
                </div>
              ) : (
                <>
                  <button onClick={() => switchProject(p.id)} className="flex-1 flex items-center gap-2 text-left min-w-0">
                    <FolderOpen size={14} className={`shrink-0 ${isActive ? 'text-lotus-400' : 'text-white/20'}`} />
                    <div className="min-w-0">
                      <div className={`text-xs font-medium truncate ${isActive ? 'text-lotus-400' : 'text-white/60'}`}>{p.name}</div>
                      <div className="flex items-center gap-1 text-[10px] text-white/20"><Clock size={8} />{date}</div>
                    </div>
                  </button>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setRenamingId(p.id); setRenameValue(p.name); }} className="p-1 rounded hover:bg-white/5 text-white/20 hover:text-white/40"><Pencil size={10} /></button>
                    <button onClick={() => deleteProject(p.id)} className="p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400"><Trash2 size={10} /></button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
