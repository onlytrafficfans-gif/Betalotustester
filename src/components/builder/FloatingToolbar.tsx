/**
 * FloatingToolbar — actions always visible
 */
import { useBuilderStore } from '@/state/builderStore';
import { generateExportFiles, exportToZip } from '@/lib/builder/exportGenerator';
import { Undo2, Redo2, Smartphone, Tablet, Monitor, Download, Upload, MessageSquare, RotateCcw, Play } from 'lucide-react';

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
}

function ToolbarButton({ icon, label, onClick, disabled, active, className = '' }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${
        active
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

export function FloatingToolbar() {
  const {
    historyIndex,
    history,
    previewDevice,
    setPreviewDevice,
    showPreview,
    setShowPreview,
    setMobileTab,
    schema,
    showToast,
  } = useBuilderStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleExport = async () => {
    try {
      const files = generateExportFiles(schema);
      await exportToZip(files, schema.name || 'lotus-export');
      showToast({ type: 'success', message: 'Export zip ready' });
    } catch (error) {
      console.error('[LOTUS] Export failed:', error);
      showToast({ type: 'error', message: 'Export failed. Try again.' });
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] hidden md:flex items-center gap-1 px-2 py-1.5 rounded-xl bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/[0.06] shadow-2xl shadow-black/50">
      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-white/[0.06]">
        <ToolbarButton
          icon={<Undo2 size={13} />}
          label="Undo"
          onClick={() => useBuilderStore.getState().undo()}
          disabled={!canUndo}
        />
        <ToolbarButton
          icon={<Redo2 size={13} />}
          label="Redo"
          onClick={() => useBuilderStore.getState().redo()}
          disabled={!canRedo}
        />
      </div>

      {/* Preview toggle */}
      <div className="flex items-center gap-0.5 px-2 border-r border-white/[0.06]">
        <ToolbarButton
          icon={<Smartphone size={13} />}
          label="Phone"
          active={previewDevice === 'phone'}
          onClick={() => { setPreviewDevice('phone'); setShowPreview(true); }}
        />
        <ToolbarButton
          icon={<Tablet size={13} />}
          label="Tablet"
          active={previewDevice === 'tablet'}
          onClick={() => { setPreviewDevice('tablet'); setShowPreview(true); }}
        />
        <ToolbarButton
          icon={<Monitor size={13} />}
          label="Desktop"
          active={previewDevice === 'desktop'}
          onClick={() => { setPreviewDevice('desktop'); setShowPreview(true); }}
        />
        <ToolbarButton
          icon={showPreview ? <RotateCcw size={13} /> : <Play size={13} />}
          label={showPreview ? 'Hide' : 'Show'}
          onClick={() => setShowPreview(!showPreview)}
          active={showPreview}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 pl-2">
        <ToolbarButton
          icon={<Download size={13} />}
          label="Export"
          onClick={handleExport}
        />
        <ToolbarButton
          icon={<Upload size={13} />}
          label="Import"
          onClick={() => setMobileTab('projects')}
        />
        {/* Chat - always visible on desktop, click focuses the chat input */}
        <ToolbarButton
          icon={<MessageSquare size={15} />}
          label="Chat"
          active={true}
          onClick={() => {
            const input = document.querySelector('[data-chat-input]') as HTMLTextAreaElement | null;
            input?.focus();
          }}
        />
      </div>
    </div>
  );
}
