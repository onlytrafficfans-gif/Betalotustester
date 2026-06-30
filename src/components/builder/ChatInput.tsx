// ChatInput — Bottom text input with send and image upload

import { useState, useRef } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import { Send, Image, Loader2 } from 'lucide-react';

export function ChatInput() {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { sendMessage, isLoading } = useBuilderStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <div className="shrink-0 border-t border-white/5 bg-[#0a0a0a] px-3 py-3">
      <div className={`flex items-end gap-2 rounded-2xl border transition-all ${
        isFocused ? 'border-lotus-400/30 bg-white/[0.03]' : 'border-white/5 bg-white/[0.02]'
      }`}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Describe your app..."
          rows={1}
          className="flex-1 bg-transparent px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none resize-none max-h-32"
        />
        <div className="flex items-center gap-1 pr-2 pb-2">
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-xl transition-all ${
              input.trim() && !isLoading
                ? 'bg-lotus-400/15 text-lotus-400 hover:bg-lotus-400/25'
                : 'text-white/10 cursor-not-allowed'
            }`}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
