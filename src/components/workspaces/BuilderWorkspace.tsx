/**
 * Builder Workspace - AI Chat and App Building
 * Reuses existing ChatPanel and ChatInput logic
 */

import { ErrorBoundary } from '../builder/ErrorBoundary';
import { ChatPanel } from '../builder/ChatPanel';

export function BuilderWorkspace() {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <ErrorBoundary>
        <ChatPanel />
      </ErrorBoundary>
    </div>
  );
}
