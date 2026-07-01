// LivePreview - live phone/tablet/desktop preview with reactive rendering

import { useCallback } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import type { AppSchema } from '@/lib/builder/appSchema';
import { AppRenderer } from '@/lib/builder/appRenderer';
import { generateExportFiles, exportToZip } from '@/lib/builder/exportGenerator';
import { PhoneShell } from './PhoneShell';
import { Download, ExternalLink, Laptop, PanelRightClose, RefreshCw, Smartphone, Tablet } from 'lucide-react';

interface LivePreviewProps {
  schema: AppSchema;
  onSchemaChange?: (schema: AppSchema) => void;
}

export function LivePreview({ schema }: LivePreviewProps) {
  const { previewDevice, setPreviewDevice, setShowPreview, setActiveScreen, showToast } = useBuilderStore();
  const handleNavigate = useCallback((screenId: string) => { setActiveScreen(screenId); }, [setActiveScreen]);
  const isDesktop = previewDevice === 'desktop';

  const handleExport = useCallback(async () => {
    try {
      const files = generateExportFiles(schema);
      await exportToZip(files, schema.name || 'lotus-export');
      showToast({ message: 'Export downloaded.', type: 'success' });
    } catch (error) {
      console.error('Export failed:', error);
      showToast({ message: 'Export failed.', type: 'error' });
    }
  }, [schema, showToast]);

  return (
    <div className="flex min-h-full w-full flex-col bg-[#08101b]">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-white/[0.06] px-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-white/64">Live Preview</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className="hidden rounded-lg p-1.5 text-white/35 transition hover:bg-white/5 hover:text-white/75 md:block"
          aria-label="Collapse preview"
        >
          <PanelRightClose size={14} />
        </button>
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col items-center overflow-auto px-4 py-4">
        <div className="mb-4 flex items-center rounded-xl border border-white/[0.07] bg-white/[0.035] p-1 shadow-[0_8px_30px_rgba(0,0,0,0.24)]">
          <PreviewButton label="Phone" active={previewDevice === 'phone'} onClick={() => setPreviewDevice('phone')} icon={<Smartphone size={15} />} />
          <PreviewButton label="Tablet" active={previewDevice === 'tablet'} onClick={() => setPreviewDevice('tablet')} icon={<Tablet size={15} />} />
          <PreviewButton label="Desktop" active={previewDevice === 'desktop'} onClick={() => setPreviewDevice('desktop')} icon={<Laptop size={15} />} />
          <PreviewButton label="Open preview" active={false} onClick={() => setShowPreview(true)} icon={<ExternalLink size={15} />} />
        </div>
        <div className="relative flex min-h-0 w-full flex-1 justify-center" data-preview-root>
          <PhoneShell device={previewDevice}>
            <div className="relative h-full w-full">
              <AppRenderer schema={schema} onNavigate={handleNavigate} isDesktop={isDesktop} />
            </div>
          </PhoneShell>
        </div>
        <div className="mt-3 flex w-full items-center gap-2 border-t border-white/[0.06] pt-3 text-xs text-white/38">
          <button type="button" className="flex items-center gap-1 transition hover:text-white/70">
            {previewDevice === 'phone' && 'iPhone 14 Pro'}
            {previewDevice === 'tablet' && 'iPad Pro'}
            {previewDevice === 'desktop' && 'Desktop'}
          </button>
          <span className="flex-1" />
          <button type="button" onClick={handleExport} className="rounded-lg p-1.5 transition hover:bg-white/5 hover:text-lotus-300" aria-label="Download export">
            <Download size={15} />
          </button>
          <button type="button" onClick={() => setShowPreview(true)} className="rounded-lg p-1.5 transition hover:bg-white/5 hover:text-white/70" aria-label="Refresh preview">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`rounded-md p-1.5 transition ${
        active ? 'bg-lotus-400/10 text-lotus-300' : 'text-white/30 hover:bg-white/5 hover:text-white/70'
      }`}
      aria-label={label}
    >
      {icon}
    </button>
  );
}
