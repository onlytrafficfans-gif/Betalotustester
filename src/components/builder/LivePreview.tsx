// LivePreview - live phone/tablet/desktop preview with reactive rendering

import { useCallback } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import type { AppSchema } from '@/lib/builder/appSchema';
import { AppRenderer } from '@/lib/builder/appRenderer';
import { generateExportFiles, exportToZip } from '@/lib/builder/exportGenerator';
import { PhoneShell } from './PhoneShell';
import { Download, Laptop, PanelRightClose, RefreshCw, Smartphone, Tablet } from 'lucide-react';

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
    <div className="flex min-h-full w-full flex-col bg-[#080808]">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-white/[0.05] px-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-white/60">{schema.name}</p>
          <p className="truncate text-[10px] text-white/25">
            {schema.screens.length} screen{schema.screens.length !== 1 ? 's' : ''}{schema.navigation.type !== 'none' ? ` · ${schema.navigation.type}` : ''}
          </p>
        </div>
        <div className="hidden items-center rounded-lg border border-white/[0.06] bg-white/[0.025] p-0.5 sm:flex">
          <PreviewButton label="Phone" active={previewDevice === 'phone'} onClick={() => setPreviewDevice('phone')} icon={<Smartphone size={14} />} />
          <PreviewButton label="Tablet" active={previewDevice === 'tablet'} onClick={() => setPreviewDevice('tablet')} icon={<Tablet size={14} />} />
          <PreviewButton label="Desktop" active={previewDevice === 'desktop'} onClick={() => setPreviewDevice('desktop')} icon={<Laptop size={14} />} />
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-white/70"
          aria-label="Refresh preview"
        >
          <RefreshCw size={15} />
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-lotus-300"
          aria-label="Download export"
        >
          <Download size={15} />
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className="hidden rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-white/70 md:block"
          aria-label="Collapse preview"
        >
          <PanelRightClose size={15} />
        </button>
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-3 overflow-auto px-4 py-5">
        <div className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white/30">
          {previewDevice === 'phone' && 'iPhone 14 Pro'}
          {previewDevice === 'tablet' && 'iPad Pro'}
          {previewDevice === 'desktop' && 'Desktop'}
        </div>
        <div className="relative flex min-h-0 w-full flex-1 justify-center" data-preview-root>
          <PhoneShell device={previewDevice}>
            <div className="relative h-full w-full">
              <AppRenderer schema={schema} onNavigate={handleNavigate} isDesktop={isDesktop} />
            </div>
          </PhoneShell>
        </div>
        <div className="pb-16 text-center md:pb-2">
          <p className="text-[10px] text-white/20">Live schema preview</p>
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
