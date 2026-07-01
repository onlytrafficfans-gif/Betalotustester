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

export function SkillsAgentsPanel({ onClose, mobile = false }: { onClose?: () => void; mobile?: boolean }) {
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
    <div className={`flex h-full min-w-0 flex-col overflow-x-hidden ${mobile ? 'bg-[#08101b] px-4 pt-[calc(16px+env(safe-area-inset-top))]' : 'bg-[#08101b]'}`}>
      <div className={`shrink-0 border-b border-white/[0.06] ${mobile ? 'pb-4' : 'px-3 py-3'}`}>
        {mobile && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-lotus-400/10">
                <span className="text-[10px] font-bold text-lotus-300">L</span>
                <img src="/logo-lotus.png" alt="LOTUS" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-semibold text-white/90">LOTUS</span>
                <span className="text-sm text-white/45">App Builder</span>
              </div>
            </div>
            {onClose && (
              <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-white/75" aria-label="Close skills">
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`${mobile ? 'text-lotus-300' : 'text-lotus-400'}`}><Wand2 size={mobile ? 34 : 14} /></span>
            <div>
              <h2 className={`${mobile ? 'text-2xl normal-case tracking-normal text-white/92' : 'text-xs uppercase tracking-wider text-white/80'} font-semibold`}>Skills / Agents</h2>
              {mobile && <p className="text-sm text-white/45">Add powerful capabilities to your app.</p>}
            </div>
          </div>
          {!mobile && (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 text-[10px] text-white/30 2xl:flex"><span className="rounded bg-lotus-400/10 px-1.5 py-0.5 text-lotus-400/70">{agentCount} agents</span><span className="rounded bg-white/5 px-1.5 py-0.5">{skillCount} skills</span></div>
              {onClose && <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-white/35 transition hover:bg-white/5 hover:text-white/75" aria-label="Close skills panel"><X size={14} /></button>}
            </div>
          )}
        </div>
        <div className="relative"><Search size={mobile ? 20 : 12} className={`absolute left-4 top-1/2 -translate-y-1/2 text-white/28 ${mobile ? '' : 'left-2.5'}`} /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search skills..." className={`${mobile ? 'h-[60px] rounded-2xl pl-12 text-base' : 'rounded-lg pl-7 py-1.5 text-xs'} w-full border border-white/[0.08] bg-white/[0.045] pr-3 text-white/75 placeholder:text-white/28 focus:border-lotus-400/30 focus:outline-none`} /></div>
      </div>
      <div className={`flex shrink-0 gap-1 overflow-x-auto border-b border-white/[0.06] ${mobile ? 'px-0 py-4' : 'px-3 py-2'}`}>
        {(['all', 'agent', 'skill'] as const).map(t => (
          <button key={t} onClick={() => setActiveType(t)} className={`${mobile ? 'rounded-xl px-5 py-3 text-sm' : 'rounded-md px-2.5 py-1 text-[10px]'} whitespace-nowrap font-medium transition-all ${activeType === t ? 'bg-lotus-400/12 text-lotus-300' : 'text-white/40 hover:bg-white/5 hover:text-white/65'}`}>{t === 'all' ? 'All' : t === 'agent' ? 'Agents' : 'Skills'}</button>
        ))}
      </div>
      <div className={`flex shrink-0 gap-1.5 overflow-x-auto border-b border-white/[0.06] ${mobile ? 'px-0 py-1 pb-4' : 'px-3 py-1.5'}`}>
        <button onClick={() => setActiveCategory('all')} className={`${mobile ? 'rounded-xl px-4 py-2 text-sm' : 'rounded px-2 py-0.5 text-[10px]'} whitespace-nowrap transition-all ${activeCategory === 'all' ? 'bg-lotus-400/12 text-lotus-300' : 'text-white/35 hover:text-white/55'}`}>All</button>
        {SKILL_CATEGORIES.map(c => <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`${mobile ? 'rounded-xl px-4 py-2 text-sm' : 'rounded px-2 py-0.5 text-[10px]'} whitespace-nowrap transition-all ${activeCategory === c.id ? 'bg-lotus-400/12 text-lotus-300' : 'text-white/35 hover:text-white/55'}`}>{c.label}</button>)}
      </div>
      <div className={`${mobile ? 'space-y-3 px-0 py-4' : 'space-y-2 px-2 py-2'} flex-1 overflow-y-auto overflow-x-hidden`}>
        {filteredSkills.length === 0 && <div className="text-center py-8"><p className="text-xs text-white/20">No skills found</p></div>}
        {filteredSkills.map(skill => <SkillCard key={skill.id} skill={skill} mobile={mobile} onUse={() => handleUseSkill(skill)} onDelete={skill.isDefault ? undefined : () => handleDeleteSkill(skill.id)} isExpanded={expandedAgent === skill.id} onToggleExpand={() => setExpandedAgent(expandedAgent === skill.id ? null : skill.id)} />)}
      </div>
      <div className={`${mobile ? 'pb-[calc(86px+env(safe-area-inset-bottom))] pt-2' : 'border-t border-white/[0.06] px-3 py-3'} shrink-0 space-y-2`}>
        {importError && <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10"><X size={10} className="text-red-400" /><span className="text-[10px] text-red-400">{importError}</span></div>}
        <button onClick={() => fileInputRef.current?.click()} className={`${mobile ? 'rounded-2xl py-5 text-base' : 'rounded-lg py-2 text-xs'} flex w-full items-center justify-center gap-2 border border-dashed border-white/12 font-medium text-white/38 transition-all hover:border-white/24 hover:text-white/62`}><Upload size={mobile ? 18 : 12} />Import skill (.md)</button>
        <input ref={fileInputRef} type="file" accept=".md,.txt,.markdown" onChange={handleImportFile} className="hidden" />
        {!mobile && <p className="text-center text-[9px] text-white/15">Markdown: # Name / ## Prompt / ## Category</p>}
      </div>
    </div>
  );
}

function SkillCard({ skill, onUse, onDelete, isExpanded, onToggleExpand, mobile = false }: { skill: Skill; onUse: () => void; onDelete?: () => void; isExpanded: boolean; onToggleExpand: () => void; mobile?: boolean }) {
  return (
    <div className={`${mobile ? 'rounded-2xl' : 'rounded-lg'} border transition-all ${isExpanded ? 'border-lotus-400/20 bg-lotus-400/[0.03]' : 'border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.055]'}`}>
      <button onClick={onToggleExpand} className={`${mobile ? 'gap-4 px-4 py-4' : 'gap-2.5 px-3 py-2.5'} flex w-full items-center text-left`}>
        <span className={`${mobile ? 'flex h-12 w-12 items-center justify-center rounded-full bg-lotus-400/10 text-lotus-300' : 'text-lotus-400/60'} shrink-0`}>{getIcon(skill.icon)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5"><span className={`${mobile ? 'text-lg' : 'text-xs'} truncate font-semibold text-white/78`}>{mobile ? `Add ${skill.name.toLowerCase()}` : skill.name}</span>{skill.type === 'agent' && <span className="shrink-0 rounded-[4px] bg-lotus-400/12 px-1.5 py-0.5 text-[9px] font-medium text-lotus-300">AGENT</span>}</div>
          <p className={`${mobile ? 'text-sm' : 'text-[10px]'} truncate text-white/42`}>{skill.description}</p>
        </div>
        <ChevronRight size={mobile ? 18 : 12} className={`shrink-0 text-white/35 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
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
