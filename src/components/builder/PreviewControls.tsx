// PreviewControls — Toolbar above the preview for undo/redo, export, refresh

import { useState } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import { generateExportFiles } from '@/lib/builder/exportGenerator';
import { exportToZip } from '@/lib/builder/exportGenerator';
import { QRPreview } from './QRPreview';
import { DeployPanel } from './DeployPanel';
import { Undo2, Redo2, Code, Download, QrCode, Rocket } from 'lucide-react';

export function PreviewControls() {
  const { undo, redo, historyIndex, schemaHistory, schema, previewDevice, setPreviewDevice } = useBuilderStore();
  const [isExporting, setIsExporting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < schemaHistory.length - 1;

  const handleExport = async () => {
    if (!schema) return;
    setIsExporting(true);
    try {
      const files = generateExportFiles(schema);
      await exportToZip(files, schema.name);
    } catch (e) {
      console.error('Export failed:', e);
    }
    setIsExporting(false);
  };

  return (
    <div className="flex items-center gap-1">
      <CB icon={<Undo2 size={13} />} label="Undo" onClick={undo} disabled={!canUndo} />
      <CB icon={<Redo2 size={13} />} label="Redo" onClick={redo} disabled={!canRedo} />
      <div className="w-px h-5 bg-white/5 mx-1" />
      <CB icon={<Code size={13} />} label="Export" onClick={handleExport} />
      <CB icon={<Download size={13} />} label="ZIP" onClick={handleExport} disabled={isExporting} />
      <CB icon={<QrCode size={13} />} label="QR" onClick={() => setShowQR(true)} />
      <CB icon={<Rocket size={13} />} label="Deploy" onClick={() => setShowDeploy(true)} />
      {showQR && <QRPreview onClose={() => setShowQR(false)} />}
      {showDeploy && <DeployPanel onClose={() => setShowDeploy(false)} />}
    </div>
  );
}

function CB({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} title={label}
      className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] transition-all ${
        disabled ? 'text-white/10 cursor-not-allowed' : 'text-white/30 hover:text-white/50 hover:bg-white/5'
      }`}>
      {icon}
    </button>
  );
}
