/**
 * ChatPanel component tests
 *
 * Covers:
 *  - Message list renders user and assistant messages
 *  - New Project button calls createNewProject
 *  - Error message renders in assistant bubble
 *  - Retry button appears when there is a failed prompt and an error
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatPanel } from '@/components/builder/ChatPanel';

// ---------------------------------------------------------------------------
// Build a complete store state that satisfies ChatPanel + ChatInput
// ---------------------------------------------------------------------------
const mockRetryLastMessage = vi.fn().mockResolvedValue(undefined);
const mockCreateNewProject = vi.fn().mockReturnValue({ id: 'new', name: 'Untitled App' });
const mockClearError = vi.fn();
const mockDismissChanges = vi.fn();
const mockSendMessage = vi.fn().mockResolvedValue(undefined);
const mockSwitchProvider = vi.fn();

function makeStoreState(overrides: Record<string, unknown> = {}) {
  return {
    messages: [],
    isLoading: false,
    error: null,
    clearError: mockClearError,
    createNewProject: mockCreateNewProject,
    project: null,
    appliedChanges: [],
    dismissChanges: mockDismissChanges,
    lastFailedPrompt: null,
    retryLastMessage: mockRetryLastMessage,
    sendMessage: mockSendMessage,
    providers: [{ id: 'mock', name: 'Demo Mock', model: 'mock', apiKey: '', apiEndpoint: '' }],
    providerId: 'mock',
    switchProvider: mockSwitchProvider,
    ...overrides,
  };
}

let storeState = makeStoreState();

vi.mock('@/state/builderStore', () => ({
  useBuilderStore: (selector?: (s: typeof storeState) => unknown) =>
    selector ? selector(storeState) : storeState,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('ChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeState = makeStoreState();
  });

  it('renders without crashing with empty messages', () => {
    render(<ChatPanel />);
    const headings = screen.queryAllByText(/LOTUS Agent/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it('renders user and assistant messages', () => {
    storeState = makeStoreState({
      messages: [
        { id: '1', role: 'user', content: 'Build me an app', timestamp: 1000 },
        { id: '2', role: 'assistant', content: 'Here is your app schema', timestamp: 2000 },
      ],
    });
    render(<ChatPanel />);
    expect(screen.getByText('Build me an app')).toBeDefined();
    expect(screen.getByText('Here is your app schema')).toBeDefined();
  });

  it('calls createNewProject when New button is clicked', () => {
    render(<ChatPanel />);
    fireEvent.click(screen.getByRole('button', { name: /new/i }));
    expect(mockCreateNewProject).toHaveBeenCalledTimes(1);
  });

  it('shows error text in the assistant message bubble', () => {
    storeState = makeStoreState({
      messages: [
        {
          id: '2',
          role: 'assistant',
          content: 'Generation failed. Check provider settings or switch to Demo Mock.',
          timestamp: 2000,
          error: 'API connection failed',
        },
      ],
    });
    render(<ChatPanel />);
    expect(screen.getByText(/generation failed/i)).toBeDefined();
  });

  it('shows the retry button when error and failed prompt are set', async () => {
    // The error banner appears via useEffect when error is set.
    // Render with error + lastFailedPrompt and wait for the banner to appear.
    storeState = makeStoreState({
      error: 'API error',
      lastFailedPrompt: 'My failed prompt',
    });
    render(<ChatPanel />);

    // The useEffect that calls setShowError(true) runs after mount.
    // ChatPanel renders the retry button only when showError===true && error && lastFailedPrompt.
    // We wait for any button with text "Retry" to appear.
    await waitFor(
      () => {
        const retryBtn = screen.queryByRole('button', { name: /retry/i });
        expect(retryBtn).not.toBeNull();
      },
      { timeout: 2000 },
    );
  });
});
