// SettingsPanel — Scrollable settings with dynamic provider management

import { useState, useCallback, useEffect } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import { RotateCcw, AlertTriangle, Layout, Database, Key, Eye, EyeOff, Check, Trash2, Zap, ExternalLink, ChevronDown, Wand2, Plus, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useUserId } from './BuilderLayout';
import { PRESET_PROVIDERS, loadStoredProviders, removeProvider, maskKey, addProvider } from '@/lib/ai/apiKeyStorage';
import type { StoredProvider } from '@/lib/ai/apiKeyStorage';

function KeyField({ config, storedProvider, onSave, onDelete }: {
  config: StoredProvider; storedProvider: StoredProvider | undefined; onSave: (p: StoredProvider) => void; onDelete: (id: string) => void;
}) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [model, setModel] = useState(config.model);
  const [modelsInput, setModelsInput] = useState(config.models.join(', '));
  const hasKey = !!storedProvider?.apiKey && storedProvider.apiKey.length > 10;

  const handleSave = useCallback(() => {
    if (!key.trim() || key.trim().length < 10) return;
    const models = modelsInput.split(',').map(m => m.trim()).filter(Boolean);
    onSave({ ...config, apiKey: key.trim(), model, models: models.length > 0 ? models : [model] });
    setSaved(true); setKey('');
    setTimeout(() => setSaved(false), 2000);
  }, [key, model, modelsInput, config, onSave]);

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-lotus-400/10 flex items-center justify-center"><Zap size={12} className="text-lotus-400" /></div>
          <span className="text-xs font-semibold text-white/70">{config.name}</span>
        </div>
        {hasKey && <span className="flex items-center gap-1 text-[10px] text-lotus-400/70 px-1.5 py-0.5 rounded bg-lotus-400/5"><Check size={10} />{storedProvider ? maskKey(storedProvider.apiKey) : 'Saved'}</span>}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input type={showKey ? 'text' : 'password'} value={key} onChange={(e) => setKey(e.target.value)} placeholder={hasKey ? 'Update key...' : 'Paste API key...'} className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 pr-8 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-lotus-400/30 font-mono" />
          <button onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40">{showKey ? <EyeOff size={13} /> : <Eye size={13} />}</button>
        </div>
        <button onClick={handleSave} disabled={!key.trim() || key.trim().length < 10} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${saved ? 'bg-lotus-400/15 text-lotus-400' : key.trim().length >= 10 ? 'bg-lotus-400/10 text-lotus-400 hover:bg-lotus-400/20' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}>{saved ? <Check size={14} /> : 'Save'}</button>
        {hasKey && <button onClick={() => onDelete(config.id)} className="px-2 py-2 rounded-lg text-xs text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Remove key"><Trash2 size={14} /></button>}
      </div>
      <div className="relative">
        <label className="text-[10px] text-white/30 mb-1 block">Default Model</label>
        <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full appearance-none bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-lotus-400/30">
          {config.models.map((m) => <option key={m} value={m} className="bg-[#1a1a1a]">{m}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-3 bottom-2.5 text-white/20 pointer-events-none" />
      </div>
      <div>
        <label className="text-[10px] text-white/30 mb-1 block">Available Models (comma-separated)</label>
        <input type="text" value={modelsInput} onChange={(e) => setModelsInput(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-lotus-400/30 font-mono" />
      </div>
      <div>
        <label className="text-[10px] text-white/30 mb-1 block">API Endpoint</label>
        <input type="text" value={config.baseUrl} readOnly className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 text-[10px] text-white/30 font-mono" />
      </div>
      <a href={getDocsUrl(config.id)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-white/20 hover:text-lotus-400/60 transition-colors"><ExternalLink size={10} />Get a {config.name} API key</a>
    </div>
  );
}

function getDocsUrl(id: string): string {
  const urls: Record<string, string> = { groq: 'https://console.groq.com/keys', openai: 'https://platform.openai.com/api-keys', anthropic: 'https://console.anthropic.com/settings/keys', deepseek: 'https://platform.deepseek.com/api_keys', gemini: 'https://aistudio.google.com/app/apikey', custom: '#' };
  return urls[id] || '#';
}

function CustomProviderForm({ onAdd }: { onAdd: (p: StoredProvider) => void }) {
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = () => {
    if (!name.trim() || !baseUrl.trim() || !apiKey.trim() || !model.trim()) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.random().toString(36).slice(2, 6);
    onAdd({ id, name: name.trim(), baseUrl: baseUrl.trim(), apiKey: apiKey.trim(), model: model.trim(), models: [model.trim()] });
    setName(''); setBaseUrl(''); setApiKey(''); setModel(''); setIsOpen(false);
  };

  if (!isOpen) return <button onClick={() => setIsOpen(true)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/10 text-white/30 hover:text-white/50 hover:border-white/20 transition-all text-xs"><Plus size={14} /> Add Custom Provider</button>;

  return (
    <div className="rounded-xl border border-lotus-400/15 bg-lotus-400/[0.02] p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-lotus-400">Add Custom Provider</span>
        <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-white/5 text-white/30"><X size={12} /></button>
      </div>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Provider name (e.g., Together AI)" className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-lotus-400/30" />
      <input type="text" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="API endpoint" className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-lotus-400/30 font-mono" />
      <div className="relative">
        <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API key" className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 pr-8 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-lotus-400/30 font-mono" />
        <button onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40"><Eye size={13} /></button>
      </div>
      <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model name" className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-lotus-400/30 font-mono" />
      <button onClick={handleAdd} disabled={!name.trim() || !baseUrl.trim() || !apiKey.trim() || !model.trim()} className="w-full py-2 rounded-lg text-xs font-medium bg-lotus-400/10 text-lotus-400 hover:bg-lotus-400/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed">Add Provider</button>
    </div>
  );
}

export function SettingsPanel() {
  const { project, resetCurrentProject, schema, providerId, switchProvider, addApiProvider, migrateFromLocalStorage } = useBuilderStore();
  const { mode, toggle } = useTheme(useUserId());
  const userId = useUserId();
  const [activeProviders, setActiveProviders] = useState<StoredProvider[]>([]);
  const [showDanger, setShowDanger] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadStoredProviders(userId)
      .then(setActiveProviders)
      .catch((error) => {
        console.error('[LOTUS] Failed to load AI providers:', error);
        setActiveProviders([]);
      });
  }, [userId]);

  const handleSaveProvider = useCallback(async (provider: StoredProvider) => {
    if (!userId) return;
    try {
      await addProvider(userId, provider);
      await addApiProvider(userId, provider);
      const updated = await loadStoredProviders(userId);
      setActiveProviders(updated);
      const hasActive = updated.find(p => p.id === provider.id && p.apiKey.length > 10);
      if (hasActive && providerId === 'mock') switchProvider(provider.id);
    } catch (error) {
      console.error('[LOTUS] Failed to save AI provider:', error);
    }
  }, [userId, providerId, switchProvider, addApiProvider]);

  const handleDeleteProvider = useCallback(async (id: string) => {
    if (!userId) return;
    try {
      await removeProvider(userId, id);
      const updated = await loadStoredProviders(userId);
      setActiveProviders(updated);
      if (providerId === id) {
        const remaining = updated.filter(p => p.apiKey.length > 10);
        switchProvider(remaining[0]?.id || 'mock');
      }
    } catch (error) {
      console.error('[LOTUS] Failed to remove AI provider:', error);
    }
  }, [userId, providerId, switchProvider]);

  const handleAddCustom = useCallback(async (provider: StoredProvider) => {
    if (!userId) return;
    try {
      await addProvider(userId, provider);
      await addApiProvider(userId, provider);
      setActiveProviders(await loadStoredProviders(userId));
      if (providerId === 'mock') switchProvider(provider.id);
    } catch (error) {
      console.error('[LOTUS] Failed to add custom provider:', error);
    }
  }, [userId, addApiProvider, providerId, switchProvider]);

  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      loadStoredProviders(userId).then(setActiveProviders).catch((error) => {
        console.error('[LOTUS] Failed to refresh AI providers:', error);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <div className="shrink-0 px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <Wand2 size={14} className="text-lotus-400" />
        <h2 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Settings</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <section className="space-y-2">
          <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5"><Sun size={10} />Appearance</h3>
          <button onClick={toggle} className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
            <div className="flex items-center gap-2">{mode === 'dark' ? <Moon size={14} className="text-lotus-400" /> : <Sun size={14} className="text-lotus-400" />}<span className="text-xs text-white/60">{mode === 'dark' ? 'Dark Mode' : 'Light Mode'}</span></div>
            <div className={`w-8 h-4 rounded-full transition-all ${mode === 'dark' ? 'bg-lotus-400' : 'bg-white/10'} relative`}><div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${mode === 'dark' ? 'left-4.5' : 'left-0.5'}`} /></div>
          </button>
        </section>
        <section className="space-y-3">
          <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5"><Key size={10} />AI Providers</h3>
          <p className="text-[10px] text-white/20 leading-relaxed">Add API keys for OpenAI-compatible providers such as Groq or OpenRouter. This demo stores keys client-side/account-side for convenience; use a server proxy before production.</p>
          {PRESET_PROVIDERS.map((preset) => <KeyField key={preset.id} config={{ ...preset, apiKey: '' }} storedProvider={activeProviders.find(p => p.id === preset.id)} onSave={handleSaveProvider} onDelete={handleDeleteProvider} />)}
          <CustomProviderForm onAdd={handleAddCustom} />
        </section>
        <section className="space-y-2">
          <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Active Provider</h3>
          <div className="flex flex-wrap gap-1.5">
            {[{ id: 'mock', name: 'Demo (no key)' }, ...activeProviders.filter(p => p.apiKey.length > 10).map(p => ({ id: p.id, name: p.name }))].map(p => (
              <button key={p.id} onClick={() => switchProvider(p.id)} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${providerId === p.id ? 'bg-lotus-400/10 text-lotus-400 border border-lotus-400/20' : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'}`}>{p.name}</button>
            ))}
          </div>
        </section>
        <section className="space-y-2">
          <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5"><Layout size={10} />Project</h3>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2">
            <div className="flex justify-between text-xs"><span className="text-white/30">Name</span><span className="text-white/60">{project?.name || 'Untitled'}</span></div>
            <div className="flex justify-between text-xs"><span className="text-white/30">Screens</span><span className="text-white/60">{(schema?.screens?.length || 0)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-white/30">Components</span><span className="text-white/60">{(schema?.screens?.reduce((acc, s) => acc + (s.components?.length || 0), 0) || 0)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-white/30">Images</span><span className="text-white/60">{(schema?.imageAssets?.length || 0)}</span></div>
          </div>
        </section>
        <section className="space-y-2">
          <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5"><Database size={10} />Data</h3>
          <button onClick={() => migrateFromLocalStorage?.()} className="w-full py-2 rounded-lg text-xs font-medium bg-white/[0.02] border border-white/5 text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all flex items-center justify-center gap-2"><Database size={12} />Migrate from Local Storage</button>
        </section>
        <section className="space-y-2">
          <button onClick={() => setShowDanger(!showDanger)} className="w-full flex items-center justify-between py-2 text-[10px] font-semibold text-red-400/40 uppercase tracking-wider hover:text-red-400/60 transition-colors"><span className="flex items-center gap-1.5"><AlertTriangle size={10} />Danger Zone</span><ChevronDown size={12} className={`transition-transform ${showDanger ? 'rotate-180' : ''}`} /></button>
          {showDanger && (
            <div className="space-y-2">
              {!confirmReset ? (
                <button onClick={() => setConfirmReset(true)} className="w-full py-2 rounded-lg text-xs font-medium bg-red-500/5 border border-red-500/10 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"><RotateCcw size={12} /> Reset Project</button>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-red-400/60 text-center">This will clear all screens and components. Are you sure?</p>
                  <div className="flex gap-2">
                    <button onClick={() => { resetCurrentProject(); setConfirmReset(false); }} className="flex-1 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">Yes, Reset</button>
                    <button onClick={() => setConfirmReset(false)} className="flex-1 py-2 rounded-lg text-xs font-medium bg-white/5 text-white/40 hover:bg-white/10 transition-all">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
