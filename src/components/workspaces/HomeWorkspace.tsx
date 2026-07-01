/**
 * Home Workspace - Dashboard
 * Features: Continue building, recent projects, quick templates, GitHub import, new project
 */

import { useBuilderStore } from '@/state/builderStore';
import { Plus, Github, Zap, FileText, Search, TrendingUp } from 'lucide-react';

export function HomeWorkspace() {
  const { projects, createNewProject, switchProject, setMobileTab } = useBuilderStore();
  const recentProjects = projects.slice(0, 3);

  const handleNewProject = () => {
    createNewProject();
    setMobileTab('builder');
  };

  const handleContinueBuilding = (projectId: string) => {
    switchProject(projectId);
    setMobileTab('builder');
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-b from-[#0a0a0a] to-[#000000] overflow-y-auto">
      {/* Header */}
      <div className="shrink-0 px-4 pt-6 pb-8 md:px-6 md:pt-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Welcome to LOTUS</h1>
        <p className="text-white/50 text-base md:text-lg">Build apps with AI in natural language</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 md:px-6 space-y-8 pb-8">
        {/* Continue Building Section */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-lotus-400" />
              Continue Building
            </h2>
            <div className="space-y-2">
              {recentProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleContinueBuilding(project.id)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-lotus-400/30 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white truncate group-hover:text-lotus-400 transition">{project.name}</p>
                      <p className="text-xs text-white/40 mt-1">
                        {project.schema.screens.length} screen{project.schema.screens.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Zap size={16} className="text-white/20 group-hover:text-lotus-400 shrink-0 ml-3 transition" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus size={18} className="text-lotus-400" />
            Create New
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleNewProject}
              className="px-4 py-4 rounded-xl border border-lotus-400/30 bg-lotus-400/5 hover:bg-lotus-400/10 hover:border-lotus-400/50 transition-all text-left"
            >
              <Plus size={20} className="text-lotus-400 mb-2" />
              <p className="font-medium text-white">Blank Project</p>
              <p className="text-xs text-white/40 mt-1">Start from scratch</p>
            </button>
            <button
              onClick={() => setMobileTab('projects')}
              className="px-4 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left"
            >
              <Github size={20} className="text-white/40 mb-2" />
              <p className="font-medium text-white">Import from GitHub</p>
              <p className="text-xs text-white/40 mt-1">Connect a repository</p>
            </button>
          </div>
        </section>

        {/* Templates Section */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText size={18} className="text-lotus-400" />
            Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                className="px-4 py-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/10 hover:border-lotus-400/20 transition-all text-left"
              >
                <p className="font-medium text-white">{template.name}</p>
                <p className="text-xs text-white/40 mt-2">{template.description}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const TEMPLATES = [
  { id: 'agent', name: 'AI Agent', description: 'Chat interface with AI integration' },
  { id: 'ecommerce', name: 'E-Commerce', description: 'Product catalog & shopping cart' },
  { id: 'dashboard', name: 'Dashboard', description: 'Analytics & metrics display' },
  { id: 'todo', name: 'Task Manager', description: 'To-do list with priorities' },
];
