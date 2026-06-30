// LivePreview — Live phone/tablet/desktop preview with reactive rendering

import { useCallback } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import type { AppSchema } from '@/lib/builder/appSchema';
import { AppRenderer } from '@/lib/builder/appRenderer';
import { PhoneShell } from './PhoneShell';

interface LivePreviewProps {
  schema: AppSchema;
  onSchemaChange?: (schema: AppSchema) => void;
}

export function LivePreview({ schema }: LivePreviewProps) {
  const { previewDevice, setActiveScreen } = useBuilderStore();
  const handleNavigate = useCallback((screenId: string) => { setActiveScreen(screenId); }, [setActiveScreen]);
  const isDesktop = previewDevice === 'desktop';

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-[10px] font-medium text-white/20 uppercase tracking-wider">
        {previewDevice === 'phone' && 'iPhone 14 Pro'}
        {previewDevice === 'tablet' && 'iPad Pro'}
        {previewDevice === 'desktop' && 'Desktop'}
      </div>
      <div className="w-full flex justify-center relative" data-preview-root>
        <PhoneShell device={previewDevice}>
          <div className="h-full w-full relative">
            <AppRenderer schema={schema} onNavigate={handleNavigate} isDesktop={isDesktop} />
          </div>
        </PhoneShell>
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs font-medium text-white/40">{schema.name}</p>
        <p className="text-[10px] text-white/20">{schema.screens.length} screen{schema.screens.length !== 1 ? 's' : ''}{schema.navigation.type !== 'none' ? ` · ${schema.navigation.type}` : ''}</p>
      </div>
    </div>
  );
}
