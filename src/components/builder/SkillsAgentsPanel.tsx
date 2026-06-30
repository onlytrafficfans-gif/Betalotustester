// Skills / Agents Panel — Right-side library

import { useState, useRef, useCallback, useEffect } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import { useUserId } from './BuilderLayout';
import { loadUserSkills, saveUserSkill, deleteUserSkill } from '@/lib/supabase/skillsStorage';
import { DEFAULT_SKILLS, parseSkillMarkdown, SKILL_CATEGORIES } from '@/lib/skills/skillsData';
import type { Skill, SkillCategory, SkillType } from '@/lib/skills/skillsData';
import { Sparkles, Bot, MessageSquare, Lock, UserCircle, Navigation, Smartphone, LayoutGrid, BarChart3, Type, Settings, Database, Moon, Palette, ShoppingCart, Dumbbell, Heart, Activity, Zap, ChevronRight, Upload, Search, Trash2, FileText, Wand2, X } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles size={14} />, Bot: <Bot size={14} />, MessageSquare: <MessageSquare size={14} />, Lock: <Lock size={14} />, UserCircle: <UserCircle size={14} />, Navigation: <Navigation size={14} />, Smartphone: <Smartphone size={14} />, LayoutGrid: <LayoutGrid size={14} />, BarChart3: <BarChart3 size={14} />, Type: <Type size={14} />, Settings: <Settings size={14} />, Database: <Database size={14} />, Moon: <Moon size={14} />, Palette: <Palette size={14} />, ShoppingCart: <ShoppingCart size={14} />, Dumbbell: <Dumbbell size={14} />, Heart: <Heart size={14} />, Activity: <Activity size={14} />, Zap: <Zap size={14} />, FileText: <FileText size={14} />, Wand2: <Wand2 size={14} />,
};

function getIcon(iconName: string): React.ReactNode { return ICON_MAP[iconName] || <Zap size={14} />; }

export function SkillsAgentsPanel() {
  const { sendMessage } = useBuilderStore();
  const userId = useUserId();
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'all'>('all');
  const [activeType, setActiveType] = useState<SkillType | 'all'>('all');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setSkills(DEFAULT_SKILLS); return; }
    loadUserSkills(userId).then(userSkills => {
      const merged = [...DEFAULT_SKILLS];
      for (const u of userSkills) { const idx = merged.findIndex(d => d.id === u.id); if (idx >= 0) merged[idx] = u; else merged.push(u); }
      setSkills(merged);
    });
  }, [userId]);

  const refreshSkills = useCallback(async () => {
    if (!userId) { setSkills(DEFAULT_SKILLS); return; }
    const userSkills = await loadUserSkills(userId);
    const merged = [...DEFAULT_SKILLS];
    for (const u of userSkills) { const idx = merged.findIndex(d => d.id === u.id); if (idx >= 0) merged[idx] = u; else merged.push(u); }
    setSkills(merged);
  }, [userId]);

  const handleUseSkill = useCallback((skill: Skill) => { sendMessage(skill.prompt); }, [sendMessage]);

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setImportError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      const skill = parseSkillMarkdown(content);
      if (skill && userId) { await saveUserSkill(userId, skill); await refreshSkills(); }
      else if (!userId) setImportError('Please sign in to import skills');
      else setImportError('Invalid skill format. Need: # Name, ## Prompt, etc.');
      e.target.value = '';
    };
    reader.onerror = () => { setImportError('Failed to read file'); e.target.value = ''; };
    reader.readAsText(file);
  }, [userId, refreshSkills]);

  const handleDeleteSkill = useCallback(async (id: string) => { if (!userId) return; await deleteUserSkill(userId, id); await refreshSkills(); }, [userId, refreshSkills]);

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = !searchQuery || skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || skill.description.toLowerCase().includes(searchQuery.toLowerCase()) || skill.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || skill.category === activeCategory;
    const matchesType = activeType === 'all' || skill.type === activeType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const agentCount = skills.filter(s => s.type === 'agent').length;
  const skillCount = skills.filter(s => s.type === 'skill').length;

  return (
    <div className="flex flex-col h-full min-w-0 overflow-x-hidden bg-[#0a0a0a] border-white/5 md:border-l">
      <div className="shrink-0 px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2"><Wand2 size={14} className="text-lotus-400" /><h2 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Skills / Agents</h2></div>
          <div className="flex items-center gap-1.5 text-[10px] text-white/30"><span className="px-1.5 py-0.5 rounded bg-lotus-400/10 text-lotus-400/70">{agentCount} agents</span><span className="px-1.5 py-0.5 rounded bg-white/5">{skillCount} skills</span></div>
        </div>
        <div className="relative"><Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search skills..." className="w-full bg-white/5 border border-white/5 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-lotus-400/30" /></div>
      </div>
      <div className="shrink-0 flex gap-0.5 px-4 py-2 border-b border-white/5">
        {(['all', 'agent', 'skill'] as const).map(t => (
          <button key={t} onClick={() => setActiveType(t)} className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${activeType === t ? 'bg-lotus-400/10 text-lotus-400' : 'text-white/30 hover:text-white/50 hover:bg-white/5'}`}>{t === 'all' ? 'All' : t === 'agent' ? 'Agents' : 'Skills'}</button>
        ))}
      </div>
      <div className="shrink-0 flex gap-0.5 px-4 py-1.5 border-b border-white/5 overflow-x-auto">
        <button onClick={() => setActiveCategory('all')} className={`px-2 py-0.5 rounded text-[10px] transition-all whitespace-nowrap ${activeCategory === 'all' ? 'text-lotus-400' : 'text-white/30 hover:text-white/50'}`}>All</button>
        {SKILL_CATEGORIES.map(c => <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-2 py-0.5 rounded text-[10px] transition-all whitespace-nowrap ${activeCategory === c.id ? 'text-lotus-400' : 'text-white/30 hover:text-white/50'}`}>{c.label}</button>)}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-1">
        {filteredSkills.length === 0 && <div className="text-center py-8"><p className="text-xs text-white/20">No skills found</p></div>}
        {filteredSkills.map(skill => <SkillCard key={skill.id} skill={skill} onUse={() => handleUseSkill(skill)} onDelete={skill.isDefault ? undefined : () => handleDeleteSkill(skill.id)} isExpanded={expandedAgent === skill.id} onToggleExpand={() => setExpandedAgent(expandedAgent === skill.id ? null : skill.id)} />)}
      </div>
      <div className="shrink-0 px-4 py-3 border-t border-white/5 space-y-2">
        {importError && <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10"><X size={10} className="text-red-400" /><span className="text-[10px] text-red-400">{importError}</span></div>}
        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border border-dashed border-white/10 text-white/30 hover:text-white/50 hover:border-white/20 transition-all"><Upload size={12} />Import skill (.md)</button>
        <input ref={fileInputRef} type="file" accept=".md,.txt,.markdown" onChange={handleImportFile} className="hidden" />
        <p className="text-[9px] text-white/15 text-center">Markdown: # Name / ## Prompt / ## Category</p>
      </div>
    </div>
  );
}

function SkillCard({ skill, onUse, onDelete, isExpanded, onToggleExpand }: { skill: Skill; onUse: () => void; onDelete?: () => void; isExpanded: boolean; onToggleExpand: () => void; }) {
  return (
    <div className={`rounded-lg border transition-all ${isExpanded ? 'border-lotus-400/20 bg-lotus-400/[0.03]' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
      <button onClick={onToggleExpand} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
        <span className="text-lotus-400/60 shrink-0">{getIcon(skill.icon)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5"><span className="text-xs font-medium text-white/70 truncate">{skill.name}</span>{skill.type === 'agent' && <span className="shrink-0 px-1 py-0 rounded-[2px] bg-lotus-400/10 text-[8px] text-lotus-400 font-medium">AGENT</span>}</div>
          <p className="text-[10px] text-white/30 truncate">{skill.description}</p>
        </div>
        <ChevronRight size={12} className={`text-white/20 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          <div className="flex flex-wrap gap-1">{skill.tags.map(tag => <span key={tag} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/30">{tag}</span>)}</div>
          <p className="text-[10px] text-white/20 leading-relaxed line-clamp-3">{skill.prompt}</p>
          <div className="flex gap-2 pt-1">
            <button onClick={onUse} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-lotus-400/10 text-lotus-400 text-[10px] font-medium hover:bg-lotus-400/20 transition-all"><Zap size={10} /> Use</button>
            {onDelete && <button onClick={onDelete} className="px-2 py-1.5 rounded-md text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete"><Trash2 size={12} /></button>}
          </div>
        </div>
      )}
    </div>
  );
}
