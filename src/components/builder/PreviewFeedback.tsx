// PreviewFeedback — Shows undo/redo availability

import { useBuilderStore } from '@/state/builderStore';
import { Undo2, Redo2 } from 'lucide-react';

export function PreviewFeedback() {
  const { historyIndex, schemaHistory, undo, redo } = useBuilderStore();
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < schemaHistory.length - 1;

  return (
    <div className="flex items-center gap-1">
      {canUndo && <button onClick={undo} className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-white/30 hover:text-white/50 hover:bg-white/5 transition-all"><Undo2 size={12} /> Undo</button>}
      {canRedo && <button onClick={redo} className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-white/30 hover:text-white/50 hover:bg-white/5 transition-all"><Redo2 size={12} /> Redo</button>}
    </div>
  );
}
