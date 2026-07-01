// ChatPanel — Working chat interface with real app-building prompts

import { useRef, useEffect, useState } from 'react';
import { useBuilderStore } from '@/state/builderStore';
import { ChatInput } from './ChatInput';
import { ToolsBar } from './ToolsBar';
import { User, Loader2, AlertCircle, Sparkles, Zap, CheckCircle2, X, ChevronDown, ChevronUp, RotateCcw, MessageSquare, Activity, Palette, ArrowRight } from 'lucide-react';

const REAL_PROMPTS = [
  { label: 'Fitness Tracker', text: 'Build me a fitness tracking app with a dark dashboard showing weekly workout stats, a workout timer screen, progress charts, and a profile screen. Use green (#22c55e) as the primary color with black (#0a0a0a) backgrounds. Add bottom navigation with Home, Workouts, Profile tabs. Include realistic sample data.' },
  { label: 'E-Commerce Store', text: 'Build me an e-commerce app with a product grid homepage, product detail screen with image gallery and add-to-cart button, a shopping cart screen showing items with quantities and total price, and a checkout screen. Use a clean white and gold (#E3B26D) theme. Add bottom navigation with Shop, Cart, Profile.' },
  { label: 'Social Media', text: 'Build me a social media app with a feed screen showing posts with user avatars, images, like and comment buttons, a create post screen, and a notifications screen. Use a dark theme with purple (#8b5cf6) accents. Add bottom navigation with Feed, Explore, Notifications, Profile.' },
  { label: 'Food Delivery', text: 'Build me a food delivery app with a restaurant list showing ratings and delivery times, a restaurant menu screen with categories, a cart screen, and an order tracking screen. Use orange (#f97316) as the primary color. Add bottom navigation with Discover, Search, Orders, Profile.' },
  { label: 'Music Player', text: 'Build me a music player app with a home screen showing featured playlists and recently played, a now playing screen with album art, playback controls, and progress bar, and a library screen with playlists. Use a dark theme with cyan (#06b6d4) accents. Add bottom navigation with Home, Search, Library.' },
  { label: 'Task Manager', text: 'Build me a task management app with a dashboard showing today\'s tasks and completion stats, a task list with categories and priorities, a create task screen with form fields, and a calendar view. Use blue (#3b82f6) as the primary color. Add bottom navigation with Tasks, Calendar, Profile.' },
];

export function ChatPanel() {
  const { messages, isLoading, error, clearError, createNewProject, project, appliedChanges, dismissChanges, lastFailedPrompt, retryLastMessage } = useBuilderStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showError, setShowError] = useState(false);
  const [showChanges, setShowChanges] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, isLoading, appliedChanges]);
  useEffect(() => { if (error) setShowError(true); }, [error]);
  useEffect(() => { if (appliedChanges.length > 0) setShowChanges(true); }, [appliedChanges]);

  const handleRetry = async () => { setIsRetrying(true); await retryLastMessage(); setIsRetrying(false); };
  const handleDismissError = () => { setShowError(false); clearError(); };

  return (
    <div className="flex h-full min-w-0 flex-col overflow-x-hidden bg-[#08101b]">
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
        <div className="min-w-0">
          <h2 className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-white/64">Chat Builder</h2>
          <p className="truncate text-[10px] text-white/25">{project?.name || 'LOTUS Agent'}</p>
        </div>
        <button onClick={() => createNewProject()} className="sr-only">New</button>
        <span className="rounded-lg p-1.5 text-white/35" aria-hidden="true" title="Chat panel">
          <X size={15} />
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-4">
        {appliedChanges.length > 0 && showChanges && (
          <div className="rounded-xl border border-lotus-400/15 bg-lotus-400/[0.04] p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-lotus-400" />
                <span className="text-xs font-semibold text-lotus-400">Changes Applied</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowChanges(!showChanges)} className="p-1 rounded hover:bg-white/5 text-white/30">
                  {showChanges ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                <button onClick={dismissChanges} className="p-1 rounded hover:bg-white/5 text-white/30"><X size={12} /></button>
              </div>
            </div>
            {showChanges && (
              <ul className="space-y-1">
                {appliedChanges.map((change, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-white/50">
                    <span className="w-1 h-1 rounded-full bg-lotus-400/60 shrink-0" />{change.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full border border-lotus-400/15 bg-lotus-400/[0.07] shadow-[0_0_50px_rgba(20,184,166,0.12)]">
              <Sparkles size={34} className="text-lotus-300/80" />
            </div>
            <span className="sr-only">LOTUS Agent</span>
            <h3 className="mb-2 text-2xl font-semibold text-white/90">Agent \ Skills</h3>
            <p className="mb-10 max-w-md text-sm leading-relaxed text-white/48">
              Describe what you want to build - apps, agents, or full products.
            </p>
            <div className="grid w-full max-w-[460px] grid-cols-1 gap-3">
              <ReferencePrompt icon={<MessageSquare size={20} />} label="Build me an agent with a chat interface" text={REAL_PROMPTS[0].text} />
              <ReferencePrompt icon={<Activity size={20} />} label="Build me a fitness app with a dashboard" text={REAL_PROMPTS[0].text} />
              <ReferencePrompt icon={<Palette size={20} />} label="Make it black and green with bottom navigation" text="Make this app black and green with bottom navigation, polished cards, clear active states, and a premium mobile-first interface." />
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-lotus-400/20 flex items-center justify-center shrink-0 mt-0.5">
                <LotusLogo className="w-7 h-7 rounded-lg" />
              </div>
            )}
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' ? 'bg-lotus-600 text-white rounded-br-md' : 'bg-white/5 border border-white/5 text-white/90 rounded-bl-md'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-lotus-100/50' : 'text-white/20'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <User size={14} className="text-white/50" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-lotus-400/20 flex items-center justify-center shrink-0 mt-0.5">
              <LotusLogo className="w-7 h-7 rounded-lg" />
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="text-lotus-400 animate-spin" />
                <span className="text-sm text-white/60">Building your app...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {showError && error && (
        <div className="shrink-0 px-4 pb-2">
          <div className="flex flex-col gap-2 px-3 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <span className="flex-1 text-xs text-red-400 leading-relaxed">{error}</span>
            </div>
            <div className="flex items-center gap-2 pl-5">
              {lastFailedPrompt && (
                <button onClick={handleRetry} disabled={isRetrying} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50">
                  <RotateCcw size={12} className={isRetrying ? 'animate-spin' : ''} />
                  {isRetrying ? 'Retrying...' : 'Retry'}
                </button>
              )}
              <button onClick={handleDismissError} className="px-3 py-1.5 rounded-md text-xs text-white/30 hover:text-white/50 hover:bg-white/5 transition-all">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      <ToolsBar />
      <ChatInput />
    </div>
  );
}

function LotusLogo({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-lotus-400/10 flex items-center justify-center ${className}`}>
      <span className="text-[10px] font-bold text-lotus-400">L</span>
      <img src="/logo-lotus.png" alt="LOTUS" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover" />
    </div>
  );
}

function ReferencePrompt({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  const { sendMessage } = useBuilderStore();
  return (
    <button
      type="button"
      onClick={() => sendMessage(text)}
      className="group flex h-[62px] items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 text-left text-sm text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:border-lotus-400/25 hover:bg-lotus-400/[0.06] hover:text-white"
    >
      <span className="text-lotus-300/80">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <ArrowRight size={16} className="text-white/35 transition group-hover:translate-x-0.5 group-hover:text-lotus-300" />
    </button>
  );
}
