/**
 * Projects Workspace - Project Management
 * Features: Project list, search, folders, favorites, archive, GitHub sync
 */

import { useBuilderStore } from '@/state/builderStore';
import { Search, FolderOpen, Star, Trash2, Copy, Download, FileJson, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function ProjectsWorkspace() {
  const { projects, switchProject, deleteProject, renameProject, setMobileTab } = useBuilderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProject = (projectId: string) => {
    switchProject(projectId);
    setMobileTab('builder');
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white mb-4">Projects</h1>
        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-lotus-400/50"
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto">
        {filteredProjects.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center px-4">
            <div>
              <FolderOpen size={48} className="mx-auto text-white/10 mb-4" />
              <p className="text-white/50">No projects yet</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="px-4 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
              >
                <button
                  onClick={() => handleSelectProject(project.id)}
                  className="w-full text-left flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white group-hover:text-lotus-400 transition truncate">{project.name}</p>
                    <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                      <span>{project.schema.screens.length} screens</span>
                      <span>•</span>
                      <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-white/40 shrink-0 ml-3 transition" />
                </button>
                {/* Project Actions - Hidden by default, visible on hover or selection */}
                <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setSelectedProjectId(selectedProjectId === project.id ? null : project.id)}
                    className="p-2 rounded-lg text-white/40 hover:bg-white/10 hover:text-white/70 transition"
                    title="Favorite"
                  >
                    <Star size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const newName = prompt('New name:', project.name);
                      if (newName) renameProject(project.id, newName);
                    }}
                    className="p-2 rounded-lg text-white/40 hover:bg-white/10 hover:text-white/70 transition"
                    title="Rename"
                  >
                    <FileJson size={16} />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-2 rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-400 transition ml-auto"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
