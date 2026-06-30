/**
 * ChatInput — provider selector + textarea + send
 */
import { useState, useRef, useEffect } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import { Send, Wand2, ChevronDown, Loader2 } from 'lucide-react';

export function ChatInput() {
  const [input, setInput] = useState('');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading, providers, providerId, switchProvider } = useBuilderStore();

  const currentProvider = providers.find((p) => p.id === providerId);
  const noProviders = providers.length === 0;

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  // Scroll to bottom when input changes
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [input]);

  return (
    <div className="relative shrink-0 border-t border-white/[0.04] bg-[#0a0a0a] px-4 py-3">
      {/* Model picker dropdown */}
      {showModelPicker && (
        <div className="absolute bottom-full left-4 mb-2 w-56 bg-[#141414] border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-white/[0.04]">
            <span className="text-[10px] text-white/30 font-medium">Select Provider</span>
          </div>
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => { switchProvider(p.id); setShowModelPicker(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-all ${providerId === p.id ? 'bg-lotus-400/10 text-lotus-400' : 'text-white/50 hover:bg-white/5 hover:text-white/70'}`}
            >
              <Wand2 size={12} />
              <span className="font-medium">{p.name}</span>
              <span className="ml-auto opacity-40">{p.model}</span>
            </button>
          ))}
          {providers.length === 0 && (
            <div className="px-3 py-3 text-[10px] text-white/30">
              Add an API key in Settings to enable AI generation.
            </div>
          )}
        </div>
      )}

      {/* Provider selector + input row */}
      <div className="flex items-end gap-2">
        {/* Provider pill */}
        <button
          onClick={() => setShowModelPicker(!showModelPicker)}
          className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-white/30 hover:text-white/50 hover:bg-white/5 transition-all mb-1"
        >
          <Wand2 size={10} />
          <span className="hidden sm:inline">{currentProvider?.name || 'Provider'}</span>
          <ChevronDown size={10} />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            data-chat-input
            value={input}
            onChange={(e) => { setInput(e.target.value); handleInput(); }}
            onKeyDown={handleKeyDown}
            placeholder={noProviders ? 'Add an API key in Settings...' : 'Describe the app you want to build...'}
            disabled={isLoading || noProviders}
            rows={1}
            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 pr-10 text-sm text-white/90 placeholder:text-white/20 resize-none focus:outline-none focus:border-lotus-400/30 focus:ring-1 focus:ring-lotus-400/10 transition-all disabled:opacity-50"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          {input.length > 0 && <span className="absolute right-3 bottom-3 text-[10px] text-white/10">{input.length}</span>}
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading || noProviders}
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${input.trim() && !isLoading && !noProviders ? 'bg-lotus-600 hover:bg-lotus-400 text-white shadow-lg shadow-lotus-400/20' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
