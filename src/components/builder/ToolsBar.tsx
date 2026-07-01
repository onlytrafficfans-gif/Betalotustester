// ToolsBar - compact desktop tool menu for files, images, actions, and integrations

import { useRef, useCallback } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import { useUserId } from './BuilderLayout';
import { saveUserFile } from '@/lib/supabase/fileStorage';
import { Image as ImageIcon, Paperclip, Plug, Search, Sparkles, Wand2, X } from 'lucide-react';

export function ToolsBar() {
  const {
    uploadImage,
    setActiveOverlay,
    isToolsOpen,
    setToolsOpen,
    showToast,
  } = useBuilderStore();
  const userId = useUserId();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadImage(file);
      showToast({ message: 'Image added to preview assets.', type: 'success' });
    } catch {
      showToast({ message: 'Image upload failed.', type: 'error' });
    }
    e.target.value = '';
  }, [showToast, uploadImage]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        await saveUserFile(userId, file.name, (reader.result as string).slice(0, 5000), file.size, file.type);
        showToast({ message: 'File saved for this demo session.', type: 'success' });
      };
      file.type.startsWith('text/') || file.type === 'application/json' ? reader.readAsText(file) : reader.readAsDataURL(file);
    } catch {
      showToast({ message: 'File upload failed.', type: 'error' });
    }
    e.target.value = '';
  }, [showToast, userId]);

  const openOverlay = useCallback((overlay: 'quickActions' | 'integrations' | 'skills') => {
    setToolsOpen(false);
    setActiveOverlay(overlay);
  }, [setActiveOverlay, setToolsOpen]);

  return (
    <div className="hidden shrink-0 border-t border-white/[0.05] bg-[#0a0a0a] md:block">
      <input ref={fileInputRef} type="file" accept=".txt,.pdf,.json,.csv,.md,.js,.ts,.css,.html" onChange={handleFileSelect} className="hidden" />
      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />

      {isToolsOpen && (
        <div className="border-b border-white/[0.05] px-3 py-2">
          <div className="rounded-xl border border-white/[0.07] bg-[#121212] p-2 shadow-2xl">
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Tools</span>
              <button
                type="button"
                onClick={() => setToolsOpen(false)}
                className="rounded-md p-1 text-white/30 transition hover:bg-white/5 hover:text-white/75"
                aria-label="Close tools"
              >
                <X size={13} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 lg:grid-cols-5">
              <ToolMenuButton icon={<Search size={14} />} label="Quick Actions" onClick={() => openOverlay('quickActions')} />
              <ToolMenuButton icon={<Paperclip size={14} />} label="File" onClick={() => fileInputRef.current?.click()} />
              <ToolMenuButton icon={<ImageIcon size={14} />} label="Image" onClick={() => imageInputRef.current?.click()} />
              <ToolMenuButton icon={<Plug size={14} />} label="Integrations" onClick={() => openOverlay('integrations')} />
              <ToolMenuButton icon={<Sparkles size={14} />} label="Skills" onClick={() => openOverlay('skills')} />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setToolsOpen(!isToolsOpen)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition ${
            isToolsOpen
              ? 'border-lotus-400/20 bg-lotus-400/10 text-lotus-300'
              : 'border-white/[0.06] text-white/45 hover:bg-white/[0.04] hover:text-white/75'
          }`}
        >
          <Wand2 size={14} />
          Tools
        </button>
        <button
          type="button"
          onClick={() => openOverlay('quickActions')}
          className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-white/35 transition hover:bg-white/[0.04] hover:text-white/70"
        >
          Quick Actions
        </button>
        <button
          type="button"
          onClick={() => openOverlay('integrations')}
          className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-white/35 transition hover:bg-white/[0.04] hover:text-white/70"
        >
          Integrations
        </button>
        <div className="flex-1" />
        <span className="text-[10px] text-white/20">Tools stay tucked away until needed</span>
      </div>
    </div>
  );
}

function ToolMenuButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-white/45 transition hover:bg-white/[0.04] hover:text-white/80"
    >
      <span className="text-lotus-300/70">{icon}</span>
      {label}
    </button>
  );
}
