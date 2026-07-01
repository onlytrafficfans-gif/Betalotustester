/**
 * Menu Workspace - Settings and Configuration
 * Features: Account, AI providers, GitHub, appearance, integrations, deployment
 */

import { useBuilderStore } from '@/state/builderStore';
import { Settings, Palette, Github, Zap, LogOut, Bell, Shield, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export function MenuWorkspace() {
  const { theme, setTheme } = useBuilderStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('appearance');

  const sections = [
    {
      id: 'appearance',
      label: 'Appearance',
      icon: <Palette size={18} />,
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Theme</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-lotus-400/20 text-lotus-400 border border-lotus-400/30'
                    : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/70'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-lotus-400/20 text-lotus-400 border border-lotus-400/30'
                    : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/70'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'providers',
      label: 'AI Providers',
      icon: <Zap size={18} />,
      content: <div className="text-xs text-white/40">Configure AI providers in Settings Panel</div>,
    },
    {
      id: 'github',
      label: 'GitHub',
      icon: <Github size={18} />,
      content: <div className="text-xs text-white/40">Connect your GitHub account to sync projects</div>,
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield size={18} />,
      content: <div className="text-xs text-white/40">Manage authentication and permissions</div>,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={18} />,
      content: <div className="text-xs text-white/40">Configure notification preferences</div>,
    },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Settings size={24} className="text-lotus-400" />
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-white/40 text-sm">Manage your LOTUS workspace</p>
      </div>

      {/* Settings Sections */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-white/10">
          {sections.map((section) => (
            <div key={section.id} className="border-b border-white/5">
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white/40 group-hover:text-white/60 transition">{section.icon}</span>
                  <span className="text-sm font-medium text-white">{section.label}</span>
                </div>
                <span className={`text-white/30 transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`}>
                  ›
                </span>
              </button>
              {expandedSection === section.id && <div className="px-4 py-4 bg-white/[0.01]">{section.content}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/10 px-4 py-4 space-y-2">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white/70">
          <span className="text-sm">Help & Documentation</span>
          <ExternalLink size={14} />
        </button>
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-white/40 hover:text-red-400">
          <span className="text-sm">Sign Out</span>
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}
