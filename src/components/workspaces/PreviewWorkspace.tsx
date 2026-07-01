/**
 * Preview Workspace - Live App Preview
 * Reuses existing LivePreview and AppRenderer
 */

import { useBuilderStore } from '@/state/builderStore';
import { LivePreview } from '../builder/LivePreview';

export function PreviewWorkspace() {
  const { schema } = useBuilderStore();

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <LivePreview schema={schema} />
    </div>
  );
}
