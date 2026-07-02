import type { AppSchema, ComponentDef } from '@/lib/builder/appSchema';

export type TemplateCategory = 'Marketing' | 'Mobile' | 'Business' | 'Commerce' | 'Services' | 'AI' | 'Creative' | 'Education';
export type TemplateThumbnailType = 'landing' | 'mobile' | 'dashboard' | 'commerce' | 'booking' | 'chatbot' | 'portfolio' | 'course';

export interface StarterTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  thumbnailType: TemplateThumbnailType;
  schema: AppSchema;
}

const creamTheme = {
  primaryColor: '#A9761B',
  backgroundColor: '#FFF8ED',
  textColor: '#2E2418',
  secondaryColor: '#F3E7D3',
  cardStyle: 'soft',
};

const darkTheme = {
  primaryColor: '#D39B37',
  backgroundColor: '#0F0B08',
  textColor: '#FFF3DF',
  secondaryColor: '#24170E',
  darkMode: true,
  cardStyle: 'glass',
};

const c = (id: string, type: string, values: Omit<ComponentDef, 'id' | 'type' | 'props'>): ComponentDef => ({
  id,
  type,
  props: {},
  ...values,
});

const nav = (items: Array<{ id: string; label: string; icon: string; screenId: string }>) => ({
  type: 'bottom-tabs' as const,
  items,
});

export const starterTemplates: StarterTemplate[] = [
  {
    id: 'landing-page',
    name: 'Landing Page',
    category: 'Marketing',
    description: 'Hero, proof, offer, pricing, and call-to-action screens.',
    thumbnailType: 'landing',
    schema: {
      name: 'Restaurant Landing',
      description: 'A conversion landing page for a premium local restaurant.',
      activeScreenId: 'home',
      theme: creamTheme,
      imageAssets: [],
      features: ['Hero offer', 'Social proof', 'Pricing cards', 'Lead capture'],
      navigation: nav([
        { id: 'home', label: 'Home', icon: 'home', screenId: 'home' },
        { id: 'menu', label: 'Menu', icon: 'grid', screenId: 'menu' },
        { id: 'book', label: 'Book', icon: 'calendar', screenId: 'book' },
      ]),
      screens: [
        {
          id: 'home',
          name: 'Home',
          title: 'Restaurant Landing',
          components: [
            c('hero-title', 'text', { variant: 'title', content: 'Golden hour dining, booked in seconds.' }),
            c('hero-copy', 'text', { variant: 'body', content: 'A refined landing page with a strong offer, menu highlights, testimonials, and a reservation flow.' }),
            c('hero-cta', 'button', { text: 'Reserve Tonight', variant: 'primary', icon: 'calendar' }),
            c('proof', 'statsRow', { stats: [{ label: 'Reviews', value: '4.9' }, { label: 'Tables', value: '42' }, { label: 'Booked', value: '88%' }] }),
            c('feature-card', 'card', { title: 'Chef tasting menu', description: 'Seasonal courses, wine pairing, and private dining options.', price: '$89' }),
            c('nav', 'bottomNav', { items: [{ label: 'Home', icon: 'home', screenId: 'home' }, { label: 'Menu', icon: 'grid', screenId: 'menu' }, { label: 'Book', icon: 'calendar', screenId: 'book' }] }),
          ],
        },
        {
          id: 'menu',
          name: 'Menu',
          title: 'Menu',
          components: [
            c('menu-head', 'header', { title: 'Menu' }),
            c('menu-tabs', 'tabs', { tabs: ['Dinner', 'Dessert', 'Wine'] }),
            c('menu-card', 'card', { title: 'Signature scallops', description: 'Brown butter, citrus, and shaved fennel.', price: '$32', rating: 4.9 }),
            c('menu-card-2', 'card', { title: 'Saffron risotto', description: 'Parmesan, herbs, and seasonal vegetables.', price: '$28', rating: 4.8 }),
          ],
        },
        {
          id: 'book',
          name: 'Book',
          title: 'Book',
          components: [
            c('book-head', 'header', { title: 'Reserve' }),
            c('book-date', 'datePicker', { label: 'Reservation date' }),
            c('book-select', 'select', { label: 'Party size', options: ['2 guests', '4 guests', '6 guests'] }),
            c('book-button', 'button', { text: 'Confirm Reservation', variant: 'primary' }),
          ],
        },
      ],
    },
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    category: 'Mobile',
    description: 'A polished multi-screen app shell with home, tasks, and profile.',
    thumbnailType: 'mobile',
    schema: {
      name: 'Fitness Tracker App',
      description: 'Daily activity, workouts, and progress tracking.',
      activeScreenId: 'home',
      theme: darkTheme,
      imageAssets: [],
      features: ['Daily stats', 'Workout list', 'Progress rings', 'Profile'],
      navigation: nav([
        { id: 'home', label: 'Home', icon: 'home', screenId: 'home' },
        { id: 'workouts', label: 'Workouts', icon: 'dumbbell', screenId: 'workouts' },
        { id: 'profile', label: 'Profile', icon: 'user', screenId: 'profile' },
      ]),
      screens: [
        {
          id: 'home',
          name: 'Home',
          title: 'Today',
          components: [
            c('fit-title', 'text', { variant: 'title', content: 'Today is yours.' }),
            c('fit-stats', 'statsRow', { stats: [{ label: 'Steps', value: '8.4k' }, { label: 'Burned', value: '420' }, { label: 'Move', value: '78%' }] }),
            c('fit-ring', 'progressRing', { title: 'Daily goal', percentage: 78 }),
            c('fit-card', 'card', { title: 'Evening strength', description: 'Upper body plan ready for 6:30 PM.', rating: 4.7 }),
            c('fit-nav', 'bottomNav', { items: [{ label: 'Home', icon: 'home', screenId: 'home' }, { label: 'Workouts', icon: 'dumbbell', screenId: 'workouts' }, { label: 'Profile', icon: 'user', screenId: 'profile' }] }),
          ],
        },
        {
          id: 'workouts',
          name: 'Workouts',
          title: 'Workouts',
          components: [c('workout-head', 'header', { title: 'Workouts' }), c('workout-list', 'workoutList', {})],
        },
        {
          id: 'profile',
          name: 'Profile',
          title: 'Profile',
          components: [c('profile-head', 'header', { title: 'Profile' }), c('profile-avatar', 'avatar', { initials: 'LT', name: 'Lotus Tester', subtitle: 'Premium plan' }), c('profile-list', 'list', { items: ['Goals', 'Devices', 'Notifications'] })],
        },
      ],
    },
  },
  {
    id: 'saas-dashboard',
    name: 'SaaS Dashboard',
    category: 'Business',
    description: 'KPIs, charts, activity, and upgrade-ready account screens.',
    thumbnailType: 'dashboard',
    schema: {
      name: 'SaaS Dashboard',
      description: 'A founder-friendly SaaS metrics dashboard.',
      activeScreenId: 'dashboard',
      theme: creamTheme,
      imageAssets: [],
      features: ['KPI cards', 'Chart area', 'Account list', 'Upgrade CTA'],
      navigation: nav([
        { id: 'dashboard', label: 'Home', icon: 'home', screenId: 'dashboard' },
        { id: 'reports', label: 'Reports', icon: 'barChart', screenId: 'reports' },
        { id: 'account', label: 'Account', icon: 'user', screenId: 'account' },
      ]),
      screens: [
        {
          id: 'dashboard',
          name: 'Dashboard',
          title: 'Dashboard',
          components: [
            c('dash-head', 'header', { title: 'Dashboard', showAddButton: true }),
            c('dash-stats', 'statsRow', { stats: [{ label: 'MRR', value: '$42k' }, { label: 'Leads', value: '318' }, { label: 'Churn', value: '1.8%' }] }),
            c('dash-chart', 'chart', {}),
            c('dash-tasks', 'taskList', { emptyState: 'No urgent tasks.' }),
            c('dash-nav', 'bottomNav', { items: [{ label: 'Home', icon: 'home', screenId: 'dashboard' }, { label: 'Reports', icon: 'barChart', screenId: 'reports' }, { label: 'Account', icon: 'user', screenId: 'account' }] }),
          ],
        },
        {
          id: 'reports',
          name: 'Reports',
          title: 'Reports',
          components: [c('reports-head', 'header', { title: 'Reports' }), c('reports-chart', 'chart', {}), c('reports-list', 'list', { items: ['Acquisition report', 'Revenue cohort', 'Retention snapshot'] })],
        },
        {
          id: 'account',
          name: 'Account',
          title: 'Account',
          components: [c('account-head', 'header', { title: 'Account' }), c('account-card', 'card', { title: 'Scale plan', description: 'Team seats, analytics, and priority support.', price: '$99/mo' })],
        },
      ],
    },
  },
  {
    id: 'ecommerce-store',
    name: 'E-commerce Store',
    category: 'Commerce',
    description: 'Catalog, product grid, cart, and checkout summary.',
    thumbnailType: 'commerce',
    schema: {
      name: 'E-Commerce Store',
      description: 'A ready-to-preview mobile storefront.',
      activeScreenId: 'shop',
      theme: creamTheme,
      imageAssets: [],
      features: ['Product grid', 'Categories', 'Cart', 'Checkout'],
      navigation: nav([
        { id: 'shop', label: 'Shop', icon: 'grid', screenId: 'shop' },
        { id: 'cart', label: 'Cart', icon: 'cart', screenId: 'cart' },
        { id: 'profile', label: 'Profile', icon: 'user', screenId: 'profile' },
      ]),
      screens: [
        {
          id: 'shop',
          name: 'Shop',
          title: 'Shop',
          components: [
            c('shop-head', 'header', { title: 'Store', showAddButton: true }),
            c('shop-search', 'searchBar', { placeholder: 'Search products' }),
            c('shop-cats', 'categoryGrid', { categories: ['New', 'Shoes', 'Bags', 'Home'] }),
            c('shop-products', 'productGrid', { title: 'Featured' }),
            c('shop-nav', 'bottomNav', { items: [{ label: 'Shop', icon: 'grid', screenId: 'shop' }, { label: 'Cart', icon: 'cart', screenId: 'cart' }, { label: 'Profile', icon: 'user', screenId: 'profile' }] }),
          ],
        },
        { id: 'cart', name: 'Cart', title: 'Cart', components: [c('cart-head', 'header', { title: 'Cart' }), c('cart-list', 'cartList', {}), c('cart-cta', 'button', { text: 'Checkout', variant: 'primary' })] },
        { id: 'profile', name: 'Profile', title: 'Profile', components: [c('store-profile', 'header', { title: 'Profile' }), c('store-list', 'list', { items: ['Orders', 'Addresses', 'Payment methods'] })] },
      ],
    },
  },
  {
    id: 'booking-app',
    name: 'Booking App',
    category: 'Services',
    description: 'Services, date selection, booking summary, and confirmation.',
    thumbnailType: 'booking',
    schema: {
      name: 'Booking App',
      description: 'A service booking app for appointments and reservations.',
      activeScreenId: 'services',
      theme: creamTheme,
      imageAssets: [],
      features: ['Service cards', 'Date picker', 'Guest selection', 'Confirmation'],
      navigation: nav([
        { id: 'services', label: 'Services', icon: 'grid', screenId: 'services' },
        { id: 'booking', label: 'Book', icon: 'calendar', screenId: 'booking' },
        { id: 'visits', label: 'Visits', icon: 'list', screenId: 'visits' },
      ]),
      screens: [
        { id: 'services', name: 'Services', title: 'Services', components: [c('svc-head', 'header', { title: 'Choose service' }), c('svc-search', 'searchBar', { placeholder: 'Search services' }), c('svc-card', 'card', { title: 'Private consultation', description: 'A 45-minute strategy session.', price: '$120', rating: 4.9 }), c('svc-card-2', 'card', { title: 'Team workshop', description: 'Planning and implementation session.', price: '$390', rating: 4.8 }), c('svc-nav', 'bottomNav', { items: [{ label: 'Services', icon: 'grid', screenId: 'services' }, { label: 'Book', icon: 'calendar', screenId: 'booking' }, { label: 'Visits', icon: 'list', screenId: 'visits' }] })] },
        { id: 'booking', name: 'Booking', title: 'Booking', components: [c('booking-head', 'header', { title: 'Book a time' }), c('booking-date', 'datePicker', { label: 'Date' }), c('booking-time', 'select', { label: 'Time', options: ['9:00 AM', '1:30 PM', '4:00 PM'] }), c('booking-summary', 'summary', { items: ['Service', 'Deposit', 'Total'] }), c('booking-cta', 'button', { text: 'Book Appointment', variant: 'primary' })] },
        { id: 'visits', name: 'Visits', title: 'Visits', components: [c('visits-head', 'header', { title: 'Upcoming' }), c('visits-list', 'list', { items: ['Consultation - Friday', 'Workshop - July 18', 'Follow-up - July 25'] })] },
      ],
    },
  },
  {
    id: 'ai-chatbot',
    name: 'AI Chatbot',
    category: 'AI',
    description: 'Assistant home, prompt input, suggestions, and chat history.',
    thumbnailType: 'chatbot',
    schema: {
      name: 'AI Chat Assistant',
      description: 'A mobile AI assistant app with prompt shortcuts.',
      activeScreenId: 'chat',
      theme: darkTheme,
      imageAssets: [],
      features: ['Prompt input', 'Suggested actions', 'Chat history', 'Settings'],
      navigation: nav([
        { id: 'chat', label: 'Chat', icon: 'bot', screenId: 'chat' },
        { id: 'history', label: 'History', icon: 'list', screenId: 'history' },
        { id: 'settings', label: 'Settings', icon: 'settings', screenId: 'settings' },
      ]),
      screens: [
        { id: 'chat', name: 'Chat', title: 'Assistant', components: [c('chat-title', 'text', { variant: 'title', content: 'What should LOTUS build?' }), c('chat-copy', 'text', { variant: 'body', content: 'Ask for screens, flows, automations, or data-backed product ideas.' }), c('chat-input', 'input', { placeholder: 'Ask the assistant...', inputType: 'text' }), c('chat-actions', 'categoryGrid', { categories: ['Draft', 'Design', 'Debug', 'Launch'] }), c('chat-card', 'card', { title: 'Demo-ready prompt', description: 'Create a booking app with auth, payments, and profile settings.' }), c('chat-nav', 'bottomNav', { items: [{ label: 'Chat', icon: 'bot', screenId: 'chat' }, { label: 'History', icon: 'list', screenId: 'history' }, { label: 'Settings', icon: 'settings', screenId: 'settings' }] })] },
        { id: 'history', name: 'History', title: 'History', components: [c('history-head', 'header', { title: 'History' }), c('history-list', 'list', { items: ['Fitness tracker app', 'Restaurant landing', 'SaaS dashboard'] })] },
        { id: 'settings', name: 'Settings', title: 'Settings', components: [c('ai-settings-head', 'header', { title: 'Settings' }), c('ai-settings-list', 'list', { items: ['Model routing', 'Memory', 'Export data'] })] },
      ],
    },
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    category: 'Creative',
    description: 'Personal brand, work samples, services, and contact flow.',
    thumbnailType: 'portfolio',
    schema: {
      name: 'Portfolio',
      description: 'A creator portfolio with featured work and inquiry capture.',
      activeScreenId: 'home',
      theme: creamTheme,
      imageAssets: [],
      features: ['Hero profile', 'Project cards', 'Services', 'Contact'],
      navigation: nav([
        { id: 'home', label: 'Home', icon: 'home', screenId: 'home' },
        { id: 'work', label: 'Work', icon: 'image', screenId: 'work' },
        { id: 'contact', label: 'Contact', icon: 'mail', screenId: 'contact' },
      ]),
      screens: [
        { id: 'home', name: 'Home', title: 'Portfolio', components: [c('port-avatar', 'avatar', { initials: 'LA', name: 'Lotus Artist', subtitle: 'Product designer and builder' }), c('port-title', 'text', { variant: 'title', content: 'Elegant product design for ambitious launches.' }), c('port-copy', 'text', { variant: 'body', content: 'A portfolio template with focused positioning, proof, and lead capture.' }), c('port-stats', 'statsRow', { stats: [{ label: 'Projects', value: '42' }, { label: 'Clients', value: '18' }, { label: 'Years', value: '7' }] }), c('port-nav', 'bottomNav', { items: [{ label: 'Home', icon: 'home', screenId: 'home' }, { label: 'Work', icon: 'image', screenId: 'work' }, { label: 'Contact', icon: 'mail', screenId: 'contact' }] })] },
        { id: 'work', name: 'Work', title: 'Work', components: [c('work-head', 'header', { title: 'Selected work' }), c('work-card', 'card', { title: 'Fintech launch system', description: 'Brand, app UI, and conversion site.', rating: 5 }), c('work-card-2', 'card', { title: 'AI onboarding flow', description: 'Activation-focused mobile product.', rating: 4.9 })] },
        { id: 'contact', name: 'Contact', title: 'Contact', components: [c('contact-head', 'header', { title: 'Contact' }), c('contact-input', 'input', { label: 'Email', placeholder: 'client@example.com', inputType: 'email' }), c('contact-message', 'input', { label: 'Project', placeholder: 'Tell me what you are building' }), c('contact-button', 'button', { text: 'Send Inquiry', variant: 'primary' })] },
      ],
    },
  },
  {
    id: 'course-lesson-app',
    name: 'Course/Lesson App',
    category: 'Education',
    description: 'Course home, lesson list, progress, and learning dashboard.',
    thumbnailType: 'course',
    schema: {
      name: 'Course Lesson App',
      description: 'A mobile learning app with lessons, progress, and resources.',
      activeScreenId: 'learn',
      theme: creamTheme,
      imageAssets: [],
      features: ['Lesson cards', 'Progress ring', 'Course modules', 'Resource list'],
      navigation: nav([
        { id: 'learn', label: 'Learn', icon: 'book', screenId: 'learn' },
        { id: 'lessons', label: 'Lessons', icon: 'list', screenId: 'lessons' },
        { id: 'profile', label: 'Profile', icon: 'user', screenId: 'profile' },
      ]),
      screens: [
        { id: 'learn', name: 'Learn', title: 'Learn', components: [c('course-title', 'text', { variant: 'title', content: 'Continue Product Design 101' }), c('course-ring', 'progressRing', { title: 'Course progress', percentage: 64 }), c('course-card', 'card', { title: 'Next lesson: Wireframes', description: 'Learn how to map screens before visual design.', rating: 4.9 }), c('course-cta', 'button', { text: 'Resume Lesson', variant: 'primary', icon: 'play' }), c('course-nav', 'bottomNav', { items: [{ label: 'Learn', icon: 'book', screenId: 'learn' }, { label: 'Lessons', icon: 'list', screenId: 'lessons' }, { label: 'Profile', icon: 'user', screenId: 'profile' }] })] },
        { id: 'lessons', name: 'Lessons', title: 'Lessons', components: [c('lessons-head', 'header', { title: 'Lessons' }), c('lessons-list', 'taskList', { emptyState: 'All lessons complete.' }), c('lessons-resources', 'list', { items: ['Foundations', 'Wireframes', 'Design systems', 'Prototype review'] })] },
        { id: 'profile', name: 'Profile', title: 'Profile', components: [c('student-head', 'header', { title: 'Student' }), c('student-avatar', 'avatar', { initials: 'ST', name: 'Student', subtitle: '64% complete' }), c('student-badge', 'badge', { text: 'Design Track' })] },
      ],
    },
  },
];

export function getTemplateById(id: string): StarterTemplate | undefined {
  return starterTemplates.find((template) => template.id === id);
}
