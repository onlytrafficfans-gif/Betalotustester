// ToolsBar — Skills, File, Image, Connect

import { useState, useRef, useCallback } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import { useUserId } from './BuilderLayout';
import { saveUserFile } from '@/lib/supabase/fileStorage';
import { Image as ImageIcon, Paperclip, Plug, Zap, ChevronDown, ChevronUp, X, Database, CreditCard, Cloud, Mail, Lock, BarChart3, Palette, Smartphone, Navigation, UserCircle, Settings as SettingsIcon, Type, LayoutGrid, Github, Bot, MessageSquare, Sparkles, Wand2 } from 'lucide-react';
import { GitHubPanel } from './GitHubPanel';

const SKILLS = [
  { icon: <Sparkles size={12} />, label: 'Build an agent', prompt: 'Build me an AI agent app with a chat interface, agent avatar, message bubbles, typing indicator, and a clean modern design. Include a home screen and a chat screen.' },
  { icon: <Bot size={12} />, label: 'Add chat interface', prompt: 'Add a chat screen with message bubbles, a text input at the bottom, and a send button. Style it like a modern messaging app.' },
  { icon: <MessageSquare size={12} />, label: 'Add AI assistant', prompt: 'Add an AI assistant screen with a bot avatar, welcome message, suggested prompts, and a chat input area' },
  { icon: <Lock size={12} />, label: 'Add login screen', prompt: 'Add a login screen with email and password fields, a sign in button, and a "Forgot password?" link. Style it clean and modern.' },
  { icon: <UserCircle size={12} />, label: 'Add profile page', prompt: 'Add a profile page with a circular avatar, user name, bio text, and a list of settings options with icons.' },
  { icon: <Navigation size={12} />, label: 'Add bottom nav', prompt: 'Add bottom tab navigation with Home, Search, and Profile tabs. Each tab should have an icon and label, with the active tab highlighted in the primary color.' },
  { icon: <Smartphone size={12} />, label: 'Add onboarding', prompt: 'Add an onboarding flow with 3 welcome screens that users can swipe through. Each screen should have an illustration area, a title, description, and a "Next" button.' },
  { icon: <Palette size={12} />, label: 'Dark theme', prompt: 'Change the theme to dark mode with deep blacks (#0a0a0a), subtle gray surfaces (#1a1a1a), and white text. Update all screens.' },
  { icon: <LayoutGrid size={12} />, label: 'Add dashboard', prompt: 'Add a dashboard screen with 4 stat cards at the top showing key metrics, followed by a recent activity list and a chart.' },
  { icon: <BarChart3 size={12} />, label: 'Add chart', prompt: 'Add a bar chart component showing data visualization with colored bars and labels.' },
  { icon: <Type size={12} />, label: 'Add search', prompt: 'Add a search screen with a search bar at the top and a list of results below with icons and subtitles.' },
  { icon: <SettingsIcon size={12} />, label: 'Add settings', prompt: 'Add a settings screen with toggle switches for notifications, dark mode, and privacy. Include section headers and dividers.' },
  { icon: <Database size={12} />, label: 'Add data list', prompt: 'Add a screen with a scrollable list of items. Each item should have an icon, title, subtitle, and a chevron arrow on the right.' },
];

const CONNECTORS = [
  { id: 'github', name: 'GitHub', desc: 'Export & Import repos', icon: <Github size={14} />, active: false, isGitHub: true },
  { id: 'supabase', name: 'Supabase', desc: 'Database & Auth', icon: <Database size={14} />, active: true },
  { id: 'stripe', name: 'Stripe', desc: 'Payments', icon: <CreditCard size={14} />, active: false },
  { id: 'firebase', name: 'Firebase', desc: 'Backend & Analytics', icon: <Cloud size={14} />, active: false },
  { id: 'sendgrid', name: 'SendGrid', desc: 'Email', icon: <Mail size={14} />, active: false },
];

export function ToolsBar() {
  const { sendMessage, uploadImage, toggleSkillsPanel } = useBuilderStore();
  const userId = useUserId();
  const [showSkills, setShowSkills] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [activeConnectors, setActiveConnectors] = useState<string[]>(['supabase']);
  const [connectView, setConnectView] = useState<'list' | 'github'>('list');
  const [fileUploading, setFileUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSkill = useCallback((prompt: string) => { setShowSkills(false); sendMessage(prompt); }, [sendMessage]);
  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; try { await uploadImage(file); } catch {} e.target.value = ''; }, [uploadImage]);
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file || !userId) return; setFileUploading(true); try { const reader = new FileReader(); reader.onload = async () => { await saveUserFile(userId, file.name, (reader.result as string).slice(0, 5000), file.size, file.type); setFileUploading(false); }; file.type.startsWith('text/') || file.type === 'application/json' ? reader.readAsText(file) : reader.readAsDataURL(file); } catch { setFileUploading(false); } e.target.value = ''; }, [userId]);
  const toggleConnector = useCallback((id: string) => { setActiveConnectors(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]); }, []);

  return (
    <div className="hidden md:block shrink-0 border-t border-white/5 bg-[#0a0a0a] relative">
      {showSkills && (
        <div className="absolute bottom-full left-0 right-0 mb-1 mx-3 z-50">
          <div className="rounded-xl bg-[#141414] border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5"><span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Quick Actions</span><button onClick={() => setShowSkills(false)} className="p-1 rounded hover:bg-white/5 text-white/30"><X size={12} /></button></div>
            <div className="grid grid-cols-2 gap-0.5 p-2 max-h-64 overflow-y-auto">
              {SKILLS.map((skill, i) => <button key={i} onClick={() => handleSkill(skill.prompt)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-all text-left"><span className="text-lotus-400/60">{skill.icon}</span><span>{skill.label}</span></button>)}
            </div>
          </div>
        </div>
      )}
      {showConnect && (
        <div className="absolute bottom-full right-0 mb-1 mr-3 w-72 z-50">
          <div className="rounded-xl bg-[#141414] border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5"><span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">{connectView === 'github' ? 'GitHub' : 'Integrations'}</span><div className="flex items-center gap-1">{connectView === 'github' && <button onClick={() => setConnectView('list')} className="p-1 rounded hover:bg-white/5 text-white/30 text-[10px]">Back</button>}<button onClick={() => setShowConnect(false)} className="p-1 rounded hover:bg-white/5 text-white/30"><X size={12} /></button></div></div>
            {connectView === 'github' ? <div className="p-3"><GitHubPanel /></div> : <><div className="p-2 space-y-1">{CONNECTORS.map((c) => <button key={c.id} onClick={() => { if ('isGitHub' in c && c.isGitHub) setConnectView('github'); else toggleConnector(c.id); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all ${activeConnectors.includes(c.id) && !('isGitHub' in c && c.isGitHub) ? 'bg-lotus-400/5 text-lotus-400' : 'text-white/40 hover:bg-white/5 hover:text-white/60'}`}>{c.icon}<div className="flex-1 text-left"><div className="font-medium">{c.name}</div><div className="text-[10px] opacity-50">{c.desc}</div></div>{'isGitHub' in c && c.isGitHub && <ChevronDown size={12} className="text-white/20 -rotate-90" />}</button>)}</div><div className="px-3 py-2 border-t border-white/5"><p className="text-[10px] text-white/20">Active integrations are included in code export.</p></div></>}
          </div>
        </div>
      )}
      <div className="flex items-center gap-0.5 px-3 py-2">
        <TBButton icon={<Zap size={14} />} label="Skills" onClick={() => { setShowSkills(!showSkills); setShowConnect(false); }} active={showSkills} />
        <TBButton icon={<Paperclip size={14} />} label={fileUploading ? '...' : 'File'} onClick={() => fileInputRef.current?.click()} /><input ref={fileInputRef} type="file" accept=".txt,.pdf,.json,.csv,.md,.js,.ts,.css,.html" onChange={handleFileSelect} className="hidden" />
        <TBButton icon={<ImageIcon size={14} />} label="Image" onClick={() => imageInputRef.current?.click()} /><input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
        <TBButton icon={<Plug size={14} />} label="Connect" onClick={() => { setShowConnect(!showConnect); setShowSkills(false); setConnectView('list'); }} active={showConnect} badge={activeConnectors.length > 0 ? activeConnectors.length : undefined} />
        <div className="w-px h-4 bg-white/5 mx-1" />
        <TBButton icon={<Wand2 size={14} />} label="Skills Panel" onClick={toggleSkillsPanel} />
        <div className="flex-1" />
        <button onClick={() => setShowSkills(!showSkills)} className="text-[10px] text-white/20 hover:text-white/40 transition-colors flex items-center gap-1">{showSkills ? <ChevronDown size={10} /> : <ChevronUp size={10} />}<span className="hidden sm:inline">{showSkills ? 'Close' : 'Tools'}</span></button>
      </div>
    </div>
  );
}

function TBButton({ icon, label, onClick, active, badge, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean; badge?: number; disabled?: boolean; }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${active ? 'bg-lotus-400/10 text-lotus-400' : disabled ? 'text-white/15 cursor-default' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}>
      {icon}<span className="hidden sm:inline">{label}</span>
      {badge !== undefined && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-lotus-400 text-[9px] text-white flex items-center justify-center font-bold">{badge}</span>}
    </button>
  );
}
