import { useRef, useState } from 'react';
import type { FormEvent, ReactElement, ReactNode } from 'react';
import {
  Bot,
  ChevronLeft,
  CirclePlay,
  Code2,
  CreditCard,
  Database,
  Folder,
  LayoutTemplate,
  Plus,
  Send,
  Settings,
  Shield,
  Sparkles,
  Wand2,
} from 'lucide-react';
import lotusFlower from '@/assets/lotus-flower.png';
import lotusLogo from '@/assets/lotus-logo.png';
import './App.css';

type ScreenName = 'home' | 'projects' | 'preview' | 'settings';
type SheetName = 'connectors' | 'templates' | 'agents';
type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
};

const screens: ScreenName[] = ['home', 'projects', 'preview', 'settings'];

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenName>('home');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [openSheet, setOpenSheet] = useState<SheetName | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const go = (screen: ScreenName) => {
    setPopoverOpen(false);
    setOpenSheet(null);
    setActiveScreen(screen);
  };

  const handleHomeTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      go(dx < 0 ? 'projects' : 'preview');
    }
  };

  const openBottomSheet = (sheet: SheetName) => {
    setPopoverOpen(false);
    setOpenSheet(sheet);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || isLoading) return;

    setInput('');
    setPopoverOpen(false);
    setIsLoading(true);
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content };
    const assistantId = crypto.randomUUID();
    setMessages((current) => [...current, userMessage, { id: assistantId, role: 'assistant', content: '', isLoading: true }]);

    try {
      const storeModule = await import('@/state/builderStore');
      const store = storeModule.useBuilderStore.getState();
      await store.sendMessage(content);
      const latestAssistant = store
        .messages
        .slice()
        .reverse()
        .find((message) => message.role === 'assistant');
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: latestAssistant?.content || 'Generation request sent.',
                isLoading: false,
              }
            : message,
        ),
      );
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: `Local-only mode: I captured "${content}". Add Supabase env vars to enable live AI generation.`,
                isLoading: false,
              }
            : message,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="lotus-page" onClick={() => setPopoverOpen(false)}>
      <div className="lotus-app" data-active-screen={activeScreen}>
        <section
          id="home"
          className={`lotus-screen ${activeScreen === 'home' ? 'active' : ''}`}
          aria-hidden={activeScreen !== 'home'}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            touchStart.current = { x: touch.clientX, y: touch.clientY };
          }}
          onTouchEnd={handleHomeTouchEnd}
        >
          <div className="toprow">
            <button className="iconbtn plain" type="button" aria-label="Settings" onClick={() => go('settings')}>
              <Settings aria-hidden="true" />
            </button>
            <button className="iconbtn" type="button" aria-label="Preview" onClick={() => go('preview')}>
              <CirclePlay aria-hidden="true" fill="currentColor" strokeWidth={0} />
            </button>
          </div>
          <div className="home-hero">
            <img src={lotusLogo} alt="LOTUS" />
          </div>
          <div className="message-thread" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`message-bubble ${message.role}`}>
                {message.isLoading ? <span className="typing-dot" /> : message.content}
              </div>
            ))}
          </div>
        </section>

        <section
          id="projects"
          className={`lotus-screen ${activeScreen === 'projects' ? 'active' : ''}`}
          aria-hidden={activeScreen !== 'projects'}
        >
          <div className="pagehead">
            <h1 className="serif title">Projects</h1>
          </div>
        </section>

        <section
          id="preview"
          className={`lotus-screen ${activeScreen === 'preview' ? 'active' : ''}`}
          aria-hidden={activeScreen !== 'preview'}
        >
          <div className="toprow">
            <button className="iconbtn plain" type="button" aria-label="Settings" onClick={() => go('settings')}>
              <Settings aria-hidden="true" />
            </button>
            <button className="iconbtn" type="button" aria-label="Preview">
              <CirclePlay aria-hidden="true" fill="currentColor" strokeWidth={0} />
            </button>
          </div>
          <div className="headtext">
            <h2 className="serif">Preview</h2>
          </div>
        </section>

        <section
          id="settings"
          className={`lotus-screen ${activeScreen === 'settings' ? 'active' : ''}`}
          aria-hidden={activeScreen !== 'settings'}
        >
          <div className="toprow">
            <button className="iconbtn" type="button" aria-label="Back" onClick={() => go('home')}>
              <ChevronLeft aria-hidden="true" />
            </button>
          </div>
          <div className="settings-head">
            <div>
              <h1 className="serif">Settings</h1>
            </div>
            <img src={lotusLogo} alt="" aria-hidden="true" />
          </div>
        </section>

        <div className={`chatwrap ${activeScreen === 'home' ? '' : 'hidden'}`} onClick={(event) => event.stopPropagation()}>
          <form className="chatbar" onSubmit={handleSubmit}>
            <button
              type="button"
              className={`pill ${isPopoverOpen ? 'open' : ''}`}
              aria-label="Add"
              aria-expanded={isPopoverOpen}
              onClick={() => setPopoverOpen((open) => !open)}
            >
              <Plus aria-hidden="true" />
            </button>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Build anything..."
              aria-label="Build prompt"
            />
            <button type="submit" className="pill" aria-label="Send" disabled={!input.trim() || isLoading}>
              <Send aria-hidden="true" />
            </button>
          </form>
        </div>

        <div className={`popover ${isPopoverOpen ? 'show' : ''}`} onClick={(event) => event.stopPropagation()}>
          <button type="button" className="pop-item" onClick={() => openBottomSheet('connectors')}>
            <Sparkles aria-hidden="true" />
            <span>
              <b>Connectors</b>
              <small>Connect APIs & services</small>
            </span>
          </button>
          <button type="button" className="pop-item" onClick={() => openBottomSheet('templates')}>
            <LayoutTemplate aria-hidden="true" />
            <span>
              <b>Templates</b>
              <small>Start from a template</small>
            </span>
          </button>
          <button type="button" className="pop-item" onClick={() => openBottomSheet('agents')}>
            <Bot aria-hidden="true" />
            <span>
              <b>Agents</b>
              <small>AI agents & skills</small>
            </span>
          </button>
        </div>

        <button
          type="button"
          className={`scrim ${openSheet ? 'show' : ''}`}
          aria-label="Close sheet"
          onClick={() => setOpenSheet(null)}
        />
        <BottomSheet name="connectors" openSheet={openSheet}>
          <SheetRow icon={<Database />} title="Database" detail="Supabase, Firebase, Postgres" tag="3" />
          <SheetRow icon={<Code2 />} title="APIs" detail="REST, GraphQL, Webhooks" tag="3" />
          <SheetRow icon={<CreditCard />} title="Payments" detail="Stripe, subscriptions, checkout" tag="1" />
          <SheetRow icon={<Shield />} title="Auth & Services" detail="OAuth, email, storage" tag="4" />
        </BottomSheet>
        <BottomSheet name="templates" openSheet={openSheet}>
          <SheetRow icon={<LayoutTemplate />} title="Landing Page" detail="Hero, features, pricing, footer" />
          <SheetRow icon={<CreditCard />} title="E-Commerce" detail="Catalog, cart, checkout" />
          <SheetRow icon={<Sparkles />} title="SaaS Dashboard" detail="Charts, tables, auth" />
          <SheetRow icon={<Bot />} title="AI Chat App" detail="Streaming chat interface" />
        </BottomSheet>
        <BottomSheet name="agents" openSheet={openSheet}>
          <SheetRow icon={<Wand2 />} title="Builder Agent" detail="Generates screens from prompts" tag="Active" />
          <SheetRow icon={<Shield />} title="QA Agent" detail="Audits layout and accessibility" />
          <SheetRow icon={<Plus />} title="Create New Agent" detail="Define role, tools, and behavior" />
        </BottomSheet>

        <nav id="nav" aria-label="Primary">
          {screens.map((screen) => (
            <button
              key={screen}
              type="button"
              className={`nav-item ${activeScreen === screen ? 'active' : ''}`}
              onClick={() => go(screen)}
              aria-current={activeScreen === screen ? 'page' : undefined}
            >
              {screen === 'home' && <img src={lotusFlower} alt="" aria-hidden="true" />}
              {screen === 'projects' && <Folder aria-hidden="true" strokeWidth={1.8} />}
              {screen === 'preview' && <CirclePlay aria-hidden="true" strokeWidth={1.8} />}
              {screen === 'settings' && <Settings aria-hidden="true" strokeWidth={1.8} />}
              {screen[0].toUpperCase() + screen.slice(1)}
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}

function BottomSheet({
  name,
  openSheet,
  children,
}: {
  name: SheetName;
  openSheet: SheetName | null;
  children: ReactNode;
}) {
  const title = name[0].toUpperCase() + name.slice(1);
  const subtitles: Record<SheetName, string> = {
    connectors: 'Connect APIs, databases, and services.',
    templates: 'Choose a starting point for your app.',
    agents: 'Create AI agents to assist your app.',
  };

  return (
    <section className={`sheet ${openSheet === name ? 'show' : ''}`} aria-hidden={openSheet !== name}>
      <div className="grab" />
      <h3 className="serif">{title}</h3>
      <div className="sh-sub">{subtitles[name]}</div>
      <div className="sheet-group">{children}</div>
    </section>
  );
}

function SheetRow({
  icon,
  title,
  detail,
  tag,
}: {
  icon: ReactElement;
  title: string;
  detail: string;
  tag?: string;
}) {
  return (
    <button type="button" className="sheet-row">
      {icon}
      <span className="rt">
        <b>{title}</b>
        <small>{detail}</small>
      </span>
      {tag ? <span className="tag">{tag}</span> : <span className="chev">›</span>}
    </button>
  );
}

export default App;
