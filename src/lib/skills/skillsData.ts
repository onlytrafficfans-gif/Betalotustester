// Skills & Agents — Pre-installed library

export type SkillType = 'skill' | 'agent';
export type SkillCategory = 'ui' | 'agent' | 'workflow' | 'integration' | 'theme';

export interface Skill {
  id: string; name: string; type: SkillType; category: SkillCategory;
  description: string; prompt: string; icon: string;
  tags: string[]; isDefault: boolean;
}

export const DEFAULT_SKILLS: Skill[] = [
  { id: 'build-agent', name: 'Build me an agent', type: 'agent', category: 'agent', description: 'Create a full AI agent app with chat, avatar, and personality', prompt: 'Build me an AI agent app with a chat interface. Include: a welcome screen with the agent avatar and greeting, a chat screen with message bubbles (user right, agent left), a typing indicator, suggested prompts at the start of the conversation, and a clean input area at the bottom. Make it feel alive and conversational.', icon: 'Sparkles', tags: ['agent', 'chat', 'ai'], isDefault: true },
  { id: 'add-chat', name: 'Add chat interface', type: 'skill', category: 'ui', description: 'Add a messaging screen with bubbles and input', prompt: 'Add a chat screen with message bubbles, a text input at the bottom with a send button, and timestamps. Style it like a modern messaging app with smooth scrolling.', icon: 'Bot', tags: ['chat', 'messaging', 'ui'], isDefault: true },
  { id: 'add-login', name: 'Add login screen', type: 'skill', category: 'ui', description: 'Email/password fields with validation', prompt: 'Add a login screen with email and password fields, a sign in button, and a "Forgot password?" link. Style it clean and modern.', icon: 'Lock', tags: ['auth', 'login', 'screen'], isDefault: true },
  { id: 'add-profile', name: 'Add profile page', type: 'skill', category: 'ui', description: 'Avatar, name, bio, and settings', prompt: 'Add a profile page with a circular avatar, user name, bio text, and a list of settings options with icons.', icon: 'UserCircle', tags: ['profile', 'user', 'screen'], isDefault: true },
  { id: 'add-nav', name: 'Add bottom navigation', type: 'skill', category: 'ui', description: 'Tab bar with icons and labels', prompt: 'Add bottom tab navigation with Home, Search, and Profile tabs. Each tab should have an icon and label, with the active tab highlighted.', icon: 'Navigation', tags: ['navigation', 'tabs', 'ui'], isDefault: true },
  { id: 'add-dashboard', name: 'Add dashboard', type: 'skill', category: 'ui', description: 'Stats cards and overview widgets', prompt: 'Add a dashboard screen with 4 stat cards at the top (showing metrics like users, revenue, orders, growth), followed by a recent activity list.', icon: 'LayoutGrid', tags: ['dashboard', 'stats', 'overview'], isDefault: true },
  { id: 'dark-theme', name: 'Dark theme', type: 'skill', category: 'theme', description: 'Deep blacks and subtle grays', prompt: 'Change the theme to dark mode with deep blacks (#0a0a0a), subtle gray surfaces (#1a1a1a), and white text. Update all screens.', icon: 'Moon', tags: ['theme', 'dark', 'style'], isDefault: true },
  { id: 'light-theme', name: 'Light theme', type: 'skill', category: 'theme', description: 'Clean white backgrounds', prompt: 'Change the theme to light mode with white backgrounds, light gray surfaces, and dark text. Update all screens.', icon: 'Sun', tags: ['theme', 'light', 'style'], isDefault: true },
  { id: 'fitness-agent', name: 'Fitness agent', type: 'agent', category: 'workflow', description: 'Workout tracker with routines and progress', prompt: 'Build me a fitness app with: a dashboard showing weekly progress, a workouts screen with exercise cards, a timer for rest periods, and a profile screen with stats. Use energetic colors like orange and black.', icon: 'Dumbbell', tags: ['fitness', 'workout', 'health'], isDefault: true },
  { id: 'social-agent', name: 'Social media agent', type: 'agent', category: 'workflow', description: 'Feed, posts, likes, and comments', prompt: 'Build me a social media app with: a feed screen showing posts with user avatars, images, like/comment buttons, a create post screen with text input and image upload, and a notifications screen.', icon: 'Heart', tags: ['social', 'feed', 'posts'], isDefault: true },
];

export const SKILL_CATEGORIES: { id: SkillCategory; label: string }[] = [
  { id: 'agent', label: 'Agents' }, { id: 'ui', label: 'UI Components' },
  { id: 'workflow', label: 'Workflows' }, { id: 'theme', label: 'Themes' },
  { id: 'integration', label: 'Integrations' },
];

export function parseSkillMarkdown(content: string): Skill | null {
  try {
    const lines = content.split('\n');
    let name = '', description = '', prompt = '', category: SkillCategory = 'ui', type: SkillType = 'skill', icon = 'Zap', tags: string[] = [];
    let section = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) name = trimmed.slice(2).trim();
      else if (trimmed.startsWith('## ')) { section = trimmed.slice(3).trim().toLowerCase(); }
      else if (trimmed && section === 'description') { description = trimmed; section = ''; }
      else if (trimmed && section === 'prompt') { prompt = trimmed; section = ''; }
      else if (trimmed && section === 'category') { const c = trimmed as SkillCategory; if (['ui','agent','workflow','theme','integration'].includes(c)) category = c; section = ''; }
      else if (trimmed && section === 'type') { const t = trimmed as SkillType; if (['skill','agent'].includes(t)) type = t; section = ''; }
      else if (trimmed && section === 'icon') { icon = trimmed; section = ''; }
      else if (trimmed && section === 'tags') { tags = trimmed.split(',').map(t => t.trim()); section = ''; }
    }
    if (!name || !prompt) return null;
    return { id: `import_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, name, type, category, description: description || name, prompt, icon, tags: tags.length > 0 ? tags : [category], isDefault: false };
  } catch { return null; }
}
