// GitHubPanel — Connect, export, and import from GitHub

import { useState, useEffect } from 'react';
import { useUserId } from './BuilderLayout';
import { saveGitHubToken, clearGitHubToken, loadGitHubUser, saveGitHubUser, hasGitHubToken } from '@/lib/github/githubStorage';
import { verifyToken, listRepos, createRepo, exportToRepo, importFromRepo } from '@/lib/github/githubClient';
import { generateExportFiles } from '@/lib/builder/exportGenerator';
import { useBuilderStore } from '@/state/builderStore';
import { Github, Eye, EyeOff, Check, Trash2, ExternalLink, FolderOpen, Upload, Download, RefreshCw, AlertCircle, ChevronDown, Lock, Globe, Plus } from 'lucide-react';

export function GitHubPanel() {
  const { schema } = useBuilderStore();
  const userId = useUserId();
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [user, setUser] = useState(loadGitHubUser(userId));
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [repos, setRepos] = useState<Array<{ id: number; name: string; full_name: string; html_url: string; private: boolean }>>([]);
  const [showRepoList, setShowRepoList] = useState(false);
  const [exportMode, setExportMode] = useState(false);
  const [repoName, setRepoName] = useState('');
  const [repoDesc, setRepoDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [exporting, setExporting] = useState(false);
  const [importMode, setImportMode] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => { if (!userId) return; hasGitHubToken(userId).then(setIsAuthed); }, [userId]);

  const verifyAndLoadUser = async () => {
    if (!userId) return; setLoading(true); setError(null);
    try { const u = await verifyToken(); saveGitHubUser(userId, u); setUser(u); setIsAuthed(true); } catch (err) { setError(err instanceof Error ? err.message : 'Invalid token'); await clearGitHubToken(userId); setIsAuthed(false); }
    setLoading(false);
  };

  const handleConnect = async () => { if (!token.trim() || token.length < 10 || !userId) return; await saveGitHubToken(userId, token.trim()); await verifyAndLoadUser(); if (!error) setToken(''); };
  const handleDisconnect = async () => { if (!userId) return; await clearGitHubToken(userId); setIsAuthed(false); setUser(null); setRepos([]); setExportMode(false); setImportMode(false); };

  const loadRepos = async () => { setLoading(true); setError(null); try { const r = await listRepos(); setRepos(r.map(repo => ({ id: repo.id, name: repo.name, full_name: repo.full_name, html_url: repo.html_url, private: repo.private }))); setShowRepoList(true); } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load repos'); } setLoading(false); };

  const handleExportNew = async () => { if (!repoName.trim() || !schema) return; setExporting(true); setError(null); try { const repo = await createRepo(repoName.trim(), repoDesc || undefined, isPrivate); const files = generateExportFiles(schema); await exportToRepo(repo.full_name.split('/')[0], repo.name, files); setMessage(`Pushed to ${repo.full_name}`); setExportMode(false); setRepoName(''); setRepoDesc(''); await loadRepos(); } catch (err) { setError(err instanceof Error ? err.message : 'Export failed'); } setExporting(false); };

  const handleExportExisting = async () => { if (!selectedRepo || !schema) return; setExporting(true); setError(null); try { const [owner, repo] = selectedRepo.split('/'); const files = generateExportFiles(schema); await exportToRepo(owner, repo, files); setMessage(`Pushed to ${selectedRepo}`); setExportMode(false); } catch (err) { setError(err instanceof Error ? err.message : 'Export failed'); } setExporting(false); };

  const handleImport = async () => { if (!importUrl.trim()) return; setImporting(true); setError(null); try { const match = importUrl.trim().match(/github\.com\/([^/]+)\/([^/]+)/); if (!match) { setError('Invalid GitHub URL. Use format: https://github.com/owner/repo'); setImporting(false); return; } const [, owner, repo] = match; const files = await importFromRepo(owner, repo); setMessage(`Imported ${files.length} files from ${owner}/${repo}`); setImportMode(false); setImportUrl(''); } catch (err) { setError(err instanceof Error ? err.message : 'Import failed'); } setImporting(false); };

  if (!isAuthed) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2"><Github size={16} className="text-white/40" /><span className="text-xs font-semibold text-white/50 uppercase tracking-wider">GitHub</span></div>
        <p className="text-xs text-white/30 leading-relaxed">Connect your GitHub account to export apps to repositories or import existing projects.</p>
        <div className="relative"><input type={showToken ? 'text' : 'password'} value={token} onChange={(e) => setToken(e.target.value)} placeholder="Personal Access Token (classic)" className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2.5 pr-8 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-lotus-400/30 font-mono" /><button onClick={() => setShowToken(!showToken)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40">{showToken ? <EyeOff size={13} /> : <Eye size={13} />}</button></div>
        <button onClick={handleConnect} disabled={!token.trim() || token.length < 10 || loading} className="w-full py-2.5 rounded-lg text-xs font-medium bg-lotus-400/10 text-lotus-400 hover:bg-lotus-400/20 transition-all disabled:opacity-30 flex items-center justify-center gap-2">{loading ? <RefreshCw size={12} className="animate-spin" /> : <Github size={14} />}{loading ? 'Verifying...' : 'Connect GitHub'}</button>
        <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-white/20 hover:text-lotus-400/60 transition-colors"><ExternalLink size={10} />Create a personal access token</a>
        {error && <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"><AlertCircle size={12} className="text-red-400 shrink-0" /><span className="text-xs text-red-400">{error}</span></div>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">{user?.avatar_url && <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full border border-white/10" />}<div className="flex-1 min-w-0"><div className="text-xs font-medium text-white/70 truncate">{user?.name || user?.login}</div><div className="text-[10px] text-white/30">@{user?.login}</div></div><button onClick={handleDisconnect} className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Disconnect"><Trash2 size={13} /></button></div>
      {message && <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-lotus-400/10 border border-lotus-400/20"><Check size={12} className="text-lotus-400 shrink-0" /><span className="text-xs text-lotus-400">{message}</span></div>}
      {error && <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"><AlertCircle size={12} className="text-red-400 shrink-0" /><span className="text-xs text-red-400">{error}</span></div>}
      <div>
        <button onClick={() => { setExportMode(!exportMode); setImportMode(false); }} className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"><div className="flex items-center gap-2"><Upload size={13} className="text-lotus-400/60" /><span className="text-xs font-medium text-white/60">Export to Repository</span></div><ChevronDown size={12} className={`text-white/20 transition-transform ${exportMode ? 'rotate-180' : ''}`} /></button>
        {exportMode && (
          <div className="mt-2 space-y-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="space-y-2"><label className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Create New Repository</label><input type="text" value={repoName} onChange={(e) => setRepoName(e.target.value)} placeholder="repo-name" className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-lotus-400/30 font-mono" /><input type="text" value={repoDesc} onChange={(e) => setRepoDesc(e.target.value)} placeholder="Description (optional)" className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-lotus-400/30" /><label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer"><input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded border-white/10 bg-white/5" /><Lock size={12} /> Private repository</label><button onClick={handleExportNew} disabled={!repoName.trim() || exporting} className="w-full py-2 rounded-lg text-xs font-medium bg-lotus-400/10 text-lotus-400 hover:bg-lotus-400/20 transition-all disabled:opacity-30 flex items-center justify-center gap-2">{exporting ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}Create & Push</button></div>
            <div className="border-t border-white/5 pt-2"><label className="text-[10px] text-white/30 font-medium uppercase tracking-wider block mb-2">Push to Existing</label><div className="flex gap-2"><select value={selectedRepo} onChange={(e) => setSelectedRepo(e.target.value)} className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-lotus-400/30"><option value="">Select repo...</option>{repos.map(r => <option key={r.id} value={r.full_name}>{r.name} {r.private ? 'Private' : 'Public'}</option>)}</select><button onClick={loadRepos} disabled={loading} className="p-2 rounded-lg bg-white/5 text-white/30 hover:text-white/50 transition-all"><RefreshCw size={12} className={loading ? 'animate-spin' : ''} /></button></div>{selectedRepo && <button onClick={handleExportExisting} disabled={exporting} className="w-full mt-2 py-2 rounded-lg text-xs font-medium bg-white/5 text-white/50 hover:bg-white/10 transition-all disabled:opacity-30">Push to {selectedRepo}</button>}</div>
          </div>
        )}
      </div>
      <div>
        <button onClick={() => { setImportMode(!importMode); setExportMode(false); }} className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"><div className="flex items-center gap-2"><Download size={13} className="text-lotus-400/60" /><span className="text-xs font-medium text-white/60">Import from Repository</span></div><ChevronDown size={12} className={`text-white/20 transition-transform ${importMode ? 'rotate-180' : ''}`} /></button>
        {importMode && <div className="mt-2 space-y-3 p-3 rounded-lg bg-white/[0.02] border border-white/5"><input type="text" value={importUrl} onChange={(e) => setImportUrl(e.target.value)} placeholder="https://github.com/owner/repo" className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-lotus-400/30 font-mono" /><button onClick={handleImport} disabled={!importUrl.trim() || importing} className="w-full py-2 rounded-lg text-xs font-medium bg-lotus-400/10 text-lotus-400 hover:bg-lotus-400/20 transition-all disabled:opacity-30 flex items-center justify-center gap-2">{importing ? <RefreshCw size={12} className="animate-spin" /> : <Download size={12} />}{importing ? 'Importing...' : 'Import'}</button></div>}
      </div>
      <button onClick={loadRepos} disabled={loading} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium bg-white/[0.02] border border-white/5 text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all disabled:opacity-30"><FolderOpen size={12} />{loading ? 'Loading...' : 'Browse My Repositories'}</button>
      {showRepoList && repos.length > 0 && <div className="space-y-1 max-h-40 overflow-y-auto">{repos.map(r => <a key={r.id} href={r.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-white/40 hover:text-white/60 hover:bg-white/5 transition-all">{r.private ? <Lock size={10} /> : <Globe size={10} />}<span className="truncate">{r.full_name}</span><ExternalLink size={10} className="ml-auto opacity-30" /></a>)}</div>}
    </div>
  );
}
