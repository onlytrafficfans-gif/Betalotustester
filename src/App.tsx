import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactElement, ReactNode } from 'react';
import {
  Bot,
  ChevronLeft,
  CirclePlay,
  Code2,
  CreditCard,
  Database,
  Folder,
  Github,
  KeyRound,
  LayoutTemplate,
  Moon,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Send,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  User,
  Wand2,
} from 'lucide-react';
import type { AppSchema } from '@/lib/builder/appSchema';
import { createEmptySchema } from '@/lib/builder/appSchema';
import lotusFlower from '@/assets/lotus-flower.png';
import lotusLogo from '@/assets/lotus-logo.png';
import './App.css';

type ScreenName = 'home' | 'projects' | 'preview' | 'settings';
type SheetName = 'connectors' | 'templates' | 'agents' | 'advanced' | 'github' | 'profile' | 'apiKeys';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
};

type LocalProject = {
  id: string;
  name: string;
  schema: AppSchema;
  createdAt: number;
  updatedAt: number;
};

const screens: ScreenName[] = ['home', 'projects', 'preview', 'settings'];
const hasSupabaseEnv = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenName>('home');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [openSheet, setOpenSheet] = useState<SheetName | null>(null);
  const [projects, setProjects] = useState<LocalProject[]>(() => [makeProject('Travel Planner')]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectSearch, setProjectSearch] = useState('');
  const [lightMode, setLightMode] = useState(true);
  const [sessionStatus, setSessionStatus] = useState(hasSupabaseEnv ? 'Connecting' : 'Local-only');
  const [storageUserId, setStorageUserId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('Guest');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileStatus, setProfileStatus] = useState('');
  const [githubOwner, setGithubOwner] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [githubRef, setGithubRef] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubStatus, setGithubStatus] = useState('');
  const [providerId, setProviderId] = useState('openrouter');
  const [providerModel, setProviderModel] = useState('google/gemini-2.0-flash-exp:free');
  const [providerKey, setProviderKey] = useState('');
  const [providerStatus, setProviderStatus] = useState('');
  const [previewModule, setPreviewModule] = useState<null | { LivePreview: (props: { schema: AppSchema }) => ReactElement }>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const currentProject = projects.find((project) => project.id === currentProjectId) ?? projects[0] ?? makeProject('New App');
  const LivePreview = previewModule?.LivePreview;
  const filteredProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter((project) => project.name.toLowerCase().includes(query));
  }, [projectSearch, projects]);

  useEffect(() => {
    if (!hasSupabaseEnv) return;
    let cancelled = false;
    void import('@/lib/supabase/auth')
      .then(async ({ getCurrentUser }) => {
        const user = await getCurrentUser();
        if (!user || cancelled) {
          if (!cancelled) setSessionStatus('Guest - Supabase Ready');
          return;
        }
        setStorageUserId(user.id);
        setProfileName(user.name || 'Guest');
        setProfileEmail(user.email || '');
        setSessionStatus('Guest - Supabase');
        await syncStore((store) => store.setCurrentUser(user));
        await migrateLegacyApiKeys(user.id);
        const [{ loadUserProjects, saveProject }] = await Promise.all([import('@/lib/supabase/projectStorage')]);
        const remote = await loadUserProjects(user.id);
        if (cancelled) return;
        if (remote.length > 0) {
          const hydrated = remote.map((project) => ({
            id: project.id,
            name: project.name,
            schema: project.schema ?? createEmptySchema(project.name),
            createdAt: new Date(project.created_at).getTime(),
            updatedAt: new Date(project.updated_at).getTime(),
          }));
          setProjects(hydrated);
          setCurrentProjectId(hydrated[0]?.id ?? null);
          await syncStore((store) => {
            store.setCurrentUser(user);
            if (hydrated[0]) store.setCurrentProject({ ...hydrated[0], history: [] });
          });
        } else {
          const seed = makeProject('Travel Planner');
          setProjects([seed]);
          setCurrentProjectId(seed.id);
          await saveProject(user.id, { id: seed.id, name: seed.name, schema: seed.schema });
          await syncStore((store) => {
            store.setCurrentUser(user);
            store.setCurrentProject({ ...seed, history: [] });
          });
        }
      })
      .catch(() => {
        if (!cancelled) setSessionStatus('Local-only');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeScreen !== 'preview' || previewModule || previewError) return;
    let cancelled = false;
    void import('@/components/builder/LivePreview')
      .then((module) => {
        if (!cancelled) setPreviewModule({ LivePreview: module.LivePreview });
      })
      .catch((error) => {
        if (!cancelled) setPreviewError(error instanceof Error ? error.message : 'Preview renderer unavailable.');
      });
    return () => {
      cancelled = true;
    };
  }, [activeScreen, previewError, previewModule]);

  const go = (screen: ScreenName) => {
    setPopoverOpen(false);
    setOpenSheet(null);
    setActiveScreen(screen);
  };

  const openBottomSheet = (sheet: SheetName) => {
    setPopoverOpen(false);
    setOpenSheet(sheet);
  };

  const persistProject = async (project: LocalProject) => {
    if (!hasSupabaseEnv || !storageUserId) return;
    const { saveProject } = await import('@/lib/supabase/projectStorage');
    await saveProject(storageUserId, { id: project.id, name: project.name, schema: project.schema }).catch(() => undefined);
  };

  const deleteStoredProject = async (id: string) => {
    if (!hasSupabaseEnv || !storageUserId) return;
    const { deleteProject } = await import('@/lib/supabase/projectStorage');
    await deleteProject(id).catch(() => undefined);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!storageUserId) {
      setProfileStatus('Connect Supabase first.');
      return;
    }
    const name = profileName.trim() || 'Guest';
    setProfileStatus('Saving...');
    try {
      const { updateProfile } = await import('@/lib/supabase/profileStorage');
      await updateProfile(storageUserId, { full_name: name, email: profileEmail.trim() || null });
      await syncStore((store) => store.setCurrentUser({ id: storageUserId, email: profileEmail.trim(), name }));
      setProfileStatus('Profile saved to Supabase.');
    } catch (error) {
      setProfileStatus(error instanceof Error ? error.message : 'Profile save failed.');
    }
  };

  const saveProviderKey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!storageUserId) {
      setProviderStatus('Connect Supabase first.');
      return;
    }
    if (!providerKey.trim()) {
      setProviderStatus('Enter an API key.');
      return;
    }
    setProviderStatus('Saving...');
    try {
      const { PRESET_PROVIDERS, addProvider } = await import('@/lib/ai/apiKeyStorage');
      const preset = PRESET_PROVIDERS.find((provider) => provider.id === providerId) ?? PRESET_PROVIDERS[0];
      await addProvider(storageUserId, {
        ...preset,
        model: providerModel.trim() || preset.model,
        apiKey: providerKey.trim(),
      });
      await syncStore((store) => store.refreshProviders(storageUserId));
      setProviderKey('');
      setProviderStatus(`${preset.name} connected.`);
    } catch (error) {
      setProviderStatus(error instanceof Error ? error.message : 'Provider save failed.');
    }
  };

  const importGitHubProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const owner = githubOwner.trim();
    const repo = githubRepo.trim();
    if (!owner || !repo) {
      setGithubStatus('Owner and repo are required.');
      return;
    }
    setGithubStatus('Importing...');
    try {
      const { loadProjectFromGitHub, saveGitHubToken } = await import('@/lib/github/githubStorage');
      if (githubToken.trim()) await saveGitHubToken(storageUserId ?? undefined, githubToken.trim());
      const schema = (await loadProjectFromGitHub(owner, repo, githubRef.trim() || undefined)) as AppSchema;
      const project = {
        id: crypto.randomUUID(),
        name: schema.name || repo,
        schema,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setProjects((current) => [project, ...current]);
      setCurrentProjectId(project.id);
      await persistProject(project);
      await syncStore((store) => store.setCurrentProject({ ...project, history: [] }));
      setGithubStatus(`Imported ${project.name}.`);
      setOpenSheet(null);
      go('projects');
    } catch (error) {
      setGithubStatus(error instanceof Error ? error.message : 'GitHub import failed.');
    }
  };

  const handleHomeTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (!touchStart.current || openSheet) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) go(dx < 0 ? 'projects' : 'preview');
  };

  const createProject = async (name = 'Untitled App') => {
    const project = makeProject(name);
    setProjects((current) => [project, ...current]);
    setCurrentProjectId(project.id);
    go('home');
    await persistProject(project);
    await syncStore((store) => {
      store.setCurrentProject({ ...project, history: [] });
      void store.saveCurrentProject();
    });
  };

  const openProject = (id: string) => {
    setCurrentProjectId(id);
    go('home');
    const project = projects.find((item) => item.id === id);
    if (project) void syncStore((store) => store.setCurrentProject({ ...project, history: [] }));
  };

  const renameProject = (id: string) => {
    const project = projects.find((item) => item.id === id);
    const name = window.prompt('Project name', project?.name ?? 'Untitled App')?.trim();
    if (!name) return;
    setProjects((current) =>
      current.map((item) =>
        item.id === id ? { ...item, name, updatedAt: Date.now(), schema: { ...item.schema, name } } : item,
      ),
    );
    const updated = projects.find((item) => item.id === id);
    if (updated) void persistProject({ ...updated, name, updatedAt: Date.now(), schema: { ...updated.schema, name } });
    void syncStore((store) => store.renameProject(id, name));
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1 || !window.confirm('Delete this project?')) return;
    setProjects((current) => current.filter((project) => project.id !== id));
    if (currentProjectId === id) setCurrentProjectId(projects.find((project) => project.id !== id)?.id ?? null);
    void deleteStoredProject(id);
    void syncStore((store) => store.deleteProject(id));
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
      await withStore(async (store) => {
        store.setCurrentProject({ ...currentProject, history: [] });
        await store.sendMessage(content);
        const state = store;
        const latestAssistant = state.messages.slice().reverse().find((message) => message.role === 'assistant');
        setProjects((current) =>
          current.map((project) =>
            project.id === currentProject.id
              ? { ...project, schema: state.schema, updatedAt: Date.now(), name: state.schema.name || project.name }
              : project,
          ),
        );
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: latestAssistant?.content || 'Generation request sent.', isLoading: false }
              : message,
          ),
        );
      });
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

  const resetAppData = () => {
    if (!window.confirm('Reset local app data?')) return;
    const project = makeProject('New App');
    setProjects([project]);
    setCurrentProjectId(project.id);
    setMessages([]);
    setProjectSearch('');
    void persistProject(project);
    void syncStore((store) => {
      store.resetStore();
      store.setCurrentProject({ ...project, history: [] });
    });
  };

  return (
    <main className={`lotus-page ${lightMode ? '' : 'dark-mode-page'}`} onClick={() => setPopoverOpen(false)}>
      <div className={`lotus-app ${lightMode ? '' : 'dark-mode'}`} data-active-screen={activeScreen}>
        <section
          id="home"
          className={`lotus-screen ${activeScreen === 'home' ? 'active' : ''}`}
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
              <Play aria-hidden="true" fill="currentColor" strokeWidth={2.2} />
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
        >
          <div className="pagehead">
            <h1 className="serif title">Projects</h1>
            <div className="page-actions">
              <button className="newproj ghost" type="button" onClick={() => openBottomSheet('github')}>
                <Github aria-hidden="true" />
                Import
              </button>
              <button className="newproj" type="button" onClick={() => createProject()}>
                <Plus aria-hidden="true" />
                New
              </button>
            </div>
          </div>
          <div className="searchrow">
            <div className="searchbar">
              <Search aria-hidden="true" />
              <input
                value={projectSearch}
                onChange={(event) => setProjectSearch(event.target.value)}
                placeholder="Search projects"
                aria-label="Search projects"
              />
            </div>
            <button className="filterbtn" type="button" aria-label="Project filters">
              <SlidersHorizontal aria-hidden="true" />
            </button>
          </div>
          <div className="projlist">
            {filteredProjects.map((project, index) => (
              <article className="projcard" key={project.id}>
                <button type="button" className={`thumb t-${index % 4}`} onClick={() => openProject(project.id)} aria-label={`Open ${project.name}`}>
                  <span className="bar" />
                  <span className="blob" />
                  <span className="blob2" />
                </button>
                <button type="button" className="meta" onClick={() => openProject(project.id)}>
                  <b>{project.name}</b>
                  <span>{project.id === currentProject.id ? 'Current project' : 'Ready to build'}</span>
                </button>
                <button type="button" className="dots" aria-label={`Rename ${project.name}`} onClick={() => renameProject(project.id)}>
                  <MoreHorizontal aria-hidden="true" />
                </button>
                <button type="button" className="trash" aria-label={`Delete ${project.name}`} onClick={() => deleteProject(project.id)}>
                  <Trash2 aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section
          id="preview"
          className={`lotus-screen ${activeScreen === 'preview' ? 'active' : ''}`}
        >
          <div className="toprow">
            <button className="iconbtn plain" type="button" aria-label="Settings" onClick={() => go('settings')}>
              <Settings aria-hidden="true" />
            </button>
            <button className="iconbtn" type="button" aria-label="Preview">
              <Play aria-hidden="true" fill="currentColor" strokeWidth={2.2} />
            </button>
          </div>
          <div className="headtext">
            <h2 className="serif">Preview</h2>
            <p>Live preview of your app</p>
          </div>
          {LivePreview ? (
            <div className="live-preview-wrap">
              <LivePreview schema={currentProject.schema} />
            </div>
          ) : (
            <div className="preview-loading">
              <CirclePlay aria-hidden="true" />
              <span>{previewError || 'Loading live preview...'}</span>
            </div>
          )}
          <div className="infocard">
            <CirclePlay aria-hidden="true" />
            <div>
              <b>{currentProject.name}</b>
              <span>{previewModule ? 'Rendering with the live schema renderer.' : previewError || 'Starting renderer...'}</span>
            </div>
          </div>
        </section>

        <section
          id="settings"
          className={`lotus-screen ${activeScreen === 'settings' ? 'active' : ''}`}
        >
          <div className="toprow">
            <button className="iconbtn" type="button" aria-label="Back" onClick={() => go('home')}>
              <ChevronLeft aria-hidden="true" />
            </button>
          </div>
          <div className="settings-head">
            <div>
              <h1 className="serif">Settings</h1>
              <div className="settings-sub">Customize your Lotus App Builder experience</div>
            </div>
            <img src={lotusLogo} alt="" aria-hidden="true" />
          </div>
          <SettingsSection label="Profile">
            <div className="profile-top">
              <div className="avatar">
                <User aria-hidden="true" />
              </div>
              <div className="pt">
                <b>{profileName || 'Guest'}</b>
                <span>{profileEmail || sessionStatus}</span>
              </div>
              <button type="button" className="tag tag-button" onClick={() => setOpenSheet('profile')}>Edit</button>
            </div>
          </SettingsSection>
          <SettingsSection label="AI & Models">
            <button type="button" className="settings-row" onClick={() => setOpenSheet('apiKeys')}>
              <KeyRound aria-hidden="true" />
              <span className="rt">
                <b>API key connection</b>
                <small>Save provider keys to your Supabase profile.</small>
              </span>
              <span className="chev">›</span>
            </button>
          </SettingsSection>
          <SettingsSection label="Builder Settings">
            <button type="button" className="settings-row" onClick={() => setLightMode((value) => !value)}>
              <Moon aria-hidden="true" />
              <span className="rt">
                <b>Light Mode</b>
                <small>Warm cream LOTUS interface</small>
              </span>
              <span className={`toggle ${lightMode ? 'on' : ''}`} />
            </button>
          </SettingsSection>
          <SettingsSection label="Data & Account">
            <div className="settings-row">
              <Database aria-hidden="true" />
              <span className="rt">
                <b>{sessionStatus}</b>
                <small>{hasSupabaseEnv ? 'Anonymous Supabase session enabled.' : 'Working locally until Supabase env vars are set.'}</small>
              </span>
            </div>
            <button type="button" className="settings-row danger" onClick={resetAppData}>
              <Trash2 aria-hidden="true" />
              <span className="rt">
                <b>Reset App Data</b>
                <small>Clear local projects and messages.</small>
              </span>
            </button>
          </SettingsSection>
          <div className="footer">Lotus App Builder v1.0.0</div>
        </section>

        <ChatControls
          activeScreen={activeScreen}
          input={input}
          isLoading={isLoading}
          isPopoverOpen={isPopoverOpen}
          setInput={setInput}
          setPopoverOpen={setPopoverOpen}
          handleSubmit={handleSubmit}
        />

        <div className={`popover ${isPopoverOpen ? 'show' : ''}`} onClick={(event) => event.stopPropagation()}>
          <PopoverButton icon={<Sparkles />} title="Connectors" detail="Connect APIs & services" onClick={() => openBottomSheet('connectors')} />
          <PopoverButton icon={<LayoutTemplate />} title="Templates" detail="Start from a template" onClick={() => openBottomSheet('templates')} />
          <PopoverButton icon={<Bot />} title="Agents" detail="AI agents & skills" onClick={() => openBottomSheet('agents')} />
        </div>

        <button type="button" className={`scrim ${openSheet ? 'show' : ''}`} aria-label="Close sheet" onClick={() => setOpenSheet(null)} />
        <BottomSheet name="connectors" openSheet={openSheet}>
          <SheetRow icon={<Database />} title="Supabase Storage" detail={hasSupabaseEnv ? 'Project storage is active' : 'Add Supabase env vars to activate'} tag={hasSupabaseEnv ? 'On' : 'Env'} />
          <SheetRow icon={<Github />} title="GitHub Import" detail="Import lotus-app.json from a repository" onClick={() => setOpenSheet('github')} />
          <SheetRow icon={<Code2 />} title="API Keys" detail="Connect OpenRouter, OpenAI, Groq, Gemini" onClick={() => setOpenSheet('apiKeys')} />
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
        <BottomSheet name="advanced" openSheet={openSheet}>
          <SheetRow icon={<Bot />} title="LOTUS Demo AI" detail="Server-managed model" tag="Default" />
          <SheetRow icon={<Sparkles />} title="Model Routing" detail="Available after Supabase env is configured" />
        </BottomSheet>
        <BottomSheet name="github" openSheet={openSheet}>
          <form className="sheet-form" onSubmit={importGitHubProject}>
            <label>
              GitHub token
              <input value={githubToken} onChange={(event) => setGithubToken(event.target.value)} type="password" autoComplete="off" />
            </label>
            <div className="form-grid">
              <label>
                Owner
                <input value={githubOwner} onChange={(event) => setGithubOwner(event.target.value)} />
              </label>
              <label>
                Repo
                <input value={githubRepo} onChange={(event) => setGithubRepo(event.target.value)} />
              </label>
            </div>
            <label>
              Branch or SHA
              <input value={githubRef} onChange={(event) => setGithubRef(event.target.value)} />
            </label>
            <button type="submit" className="sheet-submit">Import Project</button>
            {githubStatus && <div className="form-status">{githubStatus}</div>}
          </form>
        </BottomSheet>
        <BottomSheet name="profile" openSheet={openSheet}>
          <form className="sheet-form" onSubmit={saveProfile}>
            <label>
              Display name
              <input value={profileName} onChange={(event) => setProfileName(event.target.value)} />
            </label>
            <label>
              Email
              <input value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} type="email" />
            </label>
            <button type="submit" className="sheet-submit">Save Profile</button>
            {profileStatus && <div className="form-status">{profileStatus}</div>}
          </form>
        </BottomSheet>
        <BottomSheet name="apiKeys" openSheet={openSheet}>
          <form className="sheet-form" onSubmit={saveProviderKey}>
            <label>
              Provider
              <select value={providerId} onChange={(event) => setProviderId(event.target.value)}>
                <option value="openrouter">OpenRouter</option>
                <option value="openai">OpenAI</option>
                <option value="gemini">Google Gemini</option>
                <option value="groq">Groq</option>
                <option value="anthropic">Anthropic</option>
                <option value="deepseek">DeepSeek</option>
              </select>
            </label>
            <label>
              Model
              <input value={providerModel} onChange={(event) => setProviderModel(event.target.value)} />
            </label>
            <label>
              API key
              <input value={providerKey} onChange={(event) => setProviderKey(event.target.value)} type="password" autoComplete="off" />
            </label>
            <button type="submit" className="sheet-submit">Connect API Key</button>
            {providerStatus && <div className="form-status">{providerStatus}</div>}
          </form>
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

function ChatControls({
  activeScreen,
  input,
  isLoading,
  isPopoverOpen,
  setInput,
  setPopoverOpen,
  handleSubmit,
}: {
  activeScreen: ScreenName;
  input: string;
  isLoading: boolean;
  isPopoverOpen: boolean;
  setInput: (value: string) => void;
  setPopoverOpen: (updater: (open: boolean) => boolean) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
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
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Build anything..." aria-label="Build prompt" />
        <button type="submit" className="pill" aria-label="Send" disabled={!input.trim() || isLoading}>
          <Send aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

function PopoverButton({ icon, title, detail, onClick }: { icon: ReactElement; title: string; detail: string; onClick: () => void }) {
  return (
    <button type="button" className="pop-item" onClick={onClick}>
      {icon}
      <span>
        <b>{title}</b>
        <small>{detail}</small>
      </span>
    </button>
  );
}

function SettingsSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="sec">
      <div className="sec-label">{label}</div>
      <div className="settings-group">{children}</div>
    </section>
  );
}

function BottomSheet({ name, openSheet, children }: { name: SheetName; openSheet: SheetName | null; children: ReactNode }) {
  const title = name[0].toUpperCase() + name.slice(1);
  const subtitles: Record<SheetName, string> = {
    connectors: 'Connect APIs, databases, and services.',
    templates: 'Choose a starting point for your app.',
    agents: 'Create AI agents to assist your app.',
    advanced: 'Model controls stay out of the main settings surface.',
    github: 'Import an existing LOTUS project from GitHub.',
    profile: 'Manage the user profile saved in Supabase.',
    apiKeys: 'Connect real AI provider keys through Supabase.',
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

function SheetRow({ icon, title, detail, tag, onClick }: { icon: ReactElement; title: string; detail: string; tag?: string; onClick?: () => void }) {
  return (
    <button type="button" className="sheet-row" onClick={onClick}>
      {icon}
      <span className="rt">
        <b>{title}</b>
        <small>{detail}</small>
      </span>
      {tag ? <span className="tag">{tag}</span> : <span className="chev">›</span>}
    </button>
  );
}

async function withStore<T>(callback: (store: Awaited<ReturnType<typeof importStore>>) => T | Promise<T>): Promise<T> {
  if (!hasSupabaseEnv) throw new Error('Supabase env is unavailable.');
  const store = await importStore();
  return callback(store);
}

async function syncStore<T>(callback: (store: Awaited<ReturnType<typeof importStore>>) => T | Promise<T>): Promise<void> {
  if (!hasSupabaseEnv) return;
  await withStore(callback).catch(() => undefined);
}

async function migrateLegacyApiKeys(userId: string): Promise<void> {
  if (!userId || typeof localStorage === 'undefined') return;
  const { PRESET_PROVIDERS, addProvider } = await import('@/lib/ai/apiKeyStorage');
  await Promise.all(
    PRESET_PROVIDERS.map(async (preset) => {
      const apiKey = localStorage.getItem(`lotus_api_key_${preset.id}`);
      if (!apiKey) return;
      await addProvider(userId, { ...preset, apiKey }).catch(() => undefined);
    }),
  );
}

async function importStore() {
  const module = await import('@/state/builderStore');
  return module.useBuilderStore.getState();
}

function makeProject(name: string): LocalProject {
  const schema = createEmptySchema(name);
  return {
    id: crypto.randomUUID(),
    name,
    schema,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export default App;
