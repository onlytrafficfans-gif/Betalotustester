function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sentenceCase(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function pickFromPrompt(prompt, options, fallback) {
  const lower = prompt.toLowerCase();
  return options.find((option) => option.keys.some((key) => lower.includes(key)))?.value ?? fallback;
}

function inferAppName(prompt) {
  const named = prompt.match(/(?:called|named|for)\s+([A-Z][A-Za-z0-9 ]{2,24})/);
  if (named?.[1]) return named[1].trim().replace(/\s+(app|mobile|platform)$/i, '');

  return pickFromPrompt(
    prompt,
    [
      { keys: ['restaurant', 'food', 'menu', 'coffee', 'cafe'], value: 'TableGlow' },
      { keys: ['fitness', 'workout', 'gym', 'trainer'], value: 'PulseForm' },
      { keys: ['delivery', 'driver', 'route', 'logistics'], value: 'DispatchDesk' },
      { keys: ['finance', 'budget', 'invoice', 'expense'], value: 'LedgerLift' },
      { keys: ['course', 'lesson', 'school', 'learn'], value: 'LessonLane' },
      { keys: ['real estate', 'property', 'rental'], value: 'NestScope' },
      { keys: ['event', 'ticket', 'venue'], value: 'VenueFlow' },
      { keys: ['health', 'clinic', 'patient'], value: 'CareTrail' },
      { keys: ['hotel', 'travel', 'spa', 'concierge', 'guest'], value: 'StayLuxe' },
      { keys: ['shop', 'store', 'commerce', 'product'], value: 'CartMuse' }
    ],
    'Northstar'
  );
}

function inferDomain(prompt) {
  return pickFromPrompt(
    prompt,
    [
      { keys: ['restaurant', 'food', 'menu', 'coffee', 'cafe'], value: 'dining' },
      { keys: ['fitness', 'workout', 'gym', 'trainer'], value: 'fitness' },
      { keys: ['delivery', 'driver', 'route', 'logistics'], value: 'logistics' },
      { keys: ['finance', 'budget', 'invoice', 'expense'], value: 'finance' },
      { keys: ['course', 'lesson', 'school', 'learn'], value: 'education' },
      { keys: ['real estate', 'property', 'rental'], value: 'property' },
      { keys: ['event', 'ticket', 'venue'], value: 'events' },
      { keys: ['health', 'clinic', 'patient'], value: 'healthcare' },
      { keys: ['hotel', 'travel', 'spa', 'concierge', 'guest'], value: 'hospitality' },
      { keys: ['shop', 'store', 'commerce', 'product'], value: 'commerce' }
    ],
    'productivity'
  );
}

function paletteFor(domain, requestedColor) {
  if (/^#[0-9a-f]{6}$/i.test(requestedColor || '')) {
    return {
      accent: requestedColor,
      deep: '#111827',
      soft: '#F8FAFC',
      tint: '#EEF6F4'
    };
  }

  const palettes = {
    dining: { accent: '#B45309', deep: '#24140B', soft: '#FFF8ED', tint: '#F7E7D0' },
    fitness: { accent: '#DC2626', deep: '#111827', soft: '#F8FAFC', tint: '#FEE2E2' },
    logistics: { accent: '#2563EB', deep: '#0F172A', soft: '#F8FAFC', tint: '#DBEAFE' },
    finance: { accent: '#047857', deep: '#10201A', soft: '#F7FAF8', tint: '#D1FAE5' },
    education: { accent: '#7C3AED', deep: '#1E1B4B', soft: '#FAF7FF', tint: '#EDE9FE' },
    property: { accent: '#0F766E', deep: '#0F172A', soft: '#F8FAFC', tint: '#CCFBF1' },
    events: { accent: '#BE185D', deep: '#20111A', soft: '#FFF7FB', tint: '#FCE7F3' },
    healthcare: { accent: '#0284C7', deep: '#0C2430', soft: '#F5FBFF', tint: '#E0F2FE' },
    hospitality: { accent: '#7C3AED', deep: '#20143D', soft: '#FBF8FF', tint: '#EDE9FE' },
    commerce: { accent: '#DB2777', deep: '#24111A', soft: '#FFF7FB', tint: '#FCE7F3' },
    productivity: { accent: '#0F766E', deep: '#111827', soft: '#F8FAFC', tint: '#CCFBF1' }
  };
  return palettes[domain] ?? palettes.productivity;
}

function dataFor(domain, prompt) {
  const topic = sentenceCase(prompt.replace(/\s+/g, ' ').slice(0, 130));
  const base = {
    productivity: {
      headline: 'Command the day without losing the details.',
      subhead: topic || 'A focused mobile workspace with live tasks, priorities, and one clean action path.',
      primary: 'Start Focus Run',
      secondary: 'Review Queue',
      stats: [['Open', '12'], ['Due Today', '5'], ['Cleared', '84%']],
      cards: [
        ['Priority Brief', 'Client onboarding sequence is ready for review.', '10:30 AM'],
        ['Smart Follow-up', 'Three tasks can be closed from the mobile flow.', 'Now'],
        ['Launch Check', 'Release checklist is synced across the workspace.', 'Ready']
      ],
      nav: ['Today', 'Flow', 'Inbox', 'Profile']
    },
    dining: {
      headline: 'Book the table, choose the mood, arrive hungry.',
      subhead: topic || 'A premium dining app with real reservations, menu highlights, and guest preferences.',
      primary: 'Reserve Tonight',
      secondary: 'View Menu',
      stats: [['Tables', '18'], ['Rating', '4.9'], ['Wait', '12m']],
      cards: [
        ['Chef Counter', 'Two seats open for the seasonal tasting menu.', '7:30 PM'],
        ['Golden Hour', 'Patio service with citrus spritz pairing.', '$42'],
        ['Guest Notes', 'Window table, shellfish allergy, birthday dessert.', 'Saved']
      ],
      nav: ['Home', 'Menu', 'Book', 'Guest']
    },
    fitness: {
      headline: 'Train with a plan that adjusts before you stall.',
      subhead: topic || 'A coaching app with workouts, recovery, metrics, and daily readiness.',
      primary: 'Start Workout',
      secondary: 'See Recovery',
      stats: [['Readiness', '82'], ['Streak', '16'], ['Load', 'High']],
      cards: [
        ['Strength Block', 'Lower body session calibrated to recent soreness.', '42 min'],
        ['Recovery Alert', 'Hydration and sleep are pulling readiness down.', '-8%'],
        ['PR Window', 'Bench press trend suggests a safe attempt Friday.', 'Soon']
      ],
      nav: ['Today', 'Train', 'Stats', 'Coach']
    },
    logistics: {
      headline: 'Every route, driver, and delivery in one live lane.',
      subhead: topic || 'A dispatch app with route status, proof-of-delivery, and exception handling.',
      primary: 'Assign Route',
      secondary: 'Track Fleet',
      stats: [['Routes', '24'], ['On Time', '91%'], ['Alerts', '3']],
      cards: [
        ['Route 14', 'Driver Ana is two stops ahead with cold-chain verified.', 'Live'],
        ['Dock Change', 'Warehouse B moved pickup window by 18 minutes.', 'Action'],
        ['Proof Ready', 'Nine signed deliveries can be closed now.', 'Review']
      ],
      nav: ['Board', 'Routes', 'Drivers', 'Proof']
    },
    finance: {
      headline: 'See the money, catch the drift, close the month.',
      subhead: topic || 'A finance app for budgets, invoices, cash flow, and clean approvals.',
      primary: 'Approve Batch',
      secondary: 'View Cash',
      stats: [['Runway', '9.4mo'], ['Invoices', '$42k'], ['Risk', 'Low']],
      cards: [
        ['Cash Pulse', 'Receivables are covering payroll with margin intact.', '+12%'],
        ['Invoice Queue', 'Five approvals need owner confirmation.', 'Due'],
        ['Spend Drift', 'Software line is above plan by $680 this cycle.', 'Watch']
      ],
      nav: ['Cash', 'Bills', 'Budget', 'Reports']
    },
    education: {
      headline: 'Turn lessons into momentum students can feel.',
      subhead: topic || 'A learning app with lessons, progress, practice, and confident next steps.',
      primary: 'Resume Lesson',
      secondary: 'Practice',
      stats: [['Progress', '68%'], ['Streak', '9'], ['Mastery', 'B+']],
      cards: [
        ['Next Lesson', 'Design systems: tokens, spacing, and reusable parts.', '18 min'],
        ['Practice Set', 'Six questions target weak recall from yesterday.', 'Ready'],
        ['Mentor Note', 'Strong improvement on critique vocabulary.', 'New']
      ],
      nav: ['Learn', 'Practice', 'Notes', 'Profile']
    },
    property: {
      headline: 'Match buyers to homes before the best ones disappear.',
      subhead: topic || 'A property app with saved homes, tours, offers, and client context.',
      primary: 'Schedule Tour',
      secondary: 'Compare Homes',
      stats: [['Matches', '37'], ['Tours', '6'], ['Offers', '2']],
      cards: [
        ['Oakline Loft', 'South light, renovated kitchen, under target range.', '$620k'],
        ['Client Signal', 'Maya saved three homes near the same school zone.', 'Hot'],
        ['Offer Window', 'Seller deadline moved up to tomorrow morning.', 'Urgent']
      ],
      nav: ['Homes', 'Tours', 'Clients', 'Offers']
    },
    events: {
      headline: 'Fill the room and keep the night moving.',
      subhead: topic || 'An event app with tickets, guest flow, vendors, and live check-in.',
      primary: 'Open Check-in',
      secondary: 'Ticket Scan',
      stats: [['Sold', '86%'], ['Guests', '418'], ['VIP', '42']],
      cards: [
        ['Door Flow', 'East entrance is moving twice as fast as main lobby.', 'Live'],
        ['VIP Table', 'Two bottle-service confirmations need host approval.', 'Pending'],
        ['Stage Cue', 'Lighting handoff locked for the 9:15 set.', 'Ready']
      ],
      nav: ['Live', 'Guests', 'Tickets', 'Crew']
    },
    healthcare: {
      headline: 'Give care teams the context before the room opens.',
      subhead: topic || 'A care app with visits, patient notes, reminders, and handoff clarity.',
      primary: 'Open Visit',
      secondary: 'Review Notes',
      stats: [['Visits', '14'], ['On Time', '96%'], ['Flags', '2']],
      cards: [
        ['Morning Handoff', 'Two patients need medication reconciliation.', 'High'],
        ['Follow-up', 'A1C labs returned and care plan is ready.', 'Review'],
        ['Reminder Sent', 'Post-visit instructions delivered by SMS.', 'Done']
      ],
      nav: ['Today', 'Patients', 'Tasks', 'Care']
    },
    hospitality: {
      headline: 'Make every guest request feel already handled.',
      subhead: topic || 'A concierge app with room service, spa bookings, late checkout, and local recommendations.',
      primary: 'Request Service',
      secondary: 'Explore Stay',
      stats: [['Requests', '8'], ['Spa Slots', '4'], ['Rating', '4.9']],
      cards: [
        ['Room Service', 'Truffle omelet and espresso cart confirmed for Suite 18.', '22 min'],
        ['Spa Window', 'Couples massage has one opening before dinner.', '5:30 PM'],
        ['Late Checkout', 'Front desk approved 1:30 PM with luggage pickup.', 'Approved']
      ],
      nav: ['Stay', 'Dining', 'Spa', 'Guide']
    },
    commerce: {
      headline: 'Turn browsing into a cart that feels personal.',
      subhead: topic || 'A storefront app with curated products, cart recovery, offers, and clean checkout.',
      primary: 'Shop Drop',
      secondary: 'View Cart',
      stats: [['Items', '126'], ['Saved', '18'], ['Offer', '20%']],
      cards: [
        ['Featured Set', 'Three products match the customer style profile.', 'New'],
        ['Cart Recovery', 'Free shipping unlock is one item away.', '$18'],
        ['Drop Alert', 'Limited inventory is moving faster than forecast.', 'Hot']
      ],
      nav: ['Shop', 'Drops', 'Cart', 'You']
    }
  };
  return base[domain] ?? base.productivity;
}

export function generatePreviewHtml(input = {}) {
  const prompt = String(input.prompt || input.workflow || '').trim();
  const rawAppName = input.appName || inferAppName(prompt);
  const appName = escapeHtml(rawAppName);
  const domain = inferDomain(prompt);
  const palette = paletteFor(domain, input.themeColor);
  const data = dataFor(domain, prompt);
  const cards = data.cards;
  const stats = data.stats;
  const nav = data.nav;
  const safePayload = JSON.stringify({ appName: rawAppName, nav, cards, stats })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');

  const cardMarkup = cards
    .map(
      ([title, detail, meta], index) => `<button class="work-card ${index === 0 ? 'hot' : ''}" data-action="${escapeHtml(title)}">
        <span class="card-index">0${index + 1}</span>
        <span class="card-body"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(detail)}</small></span>
        <em>${escapeHtml(meta)}</em>
      </button>`
    )
    .join('');
  const statMarkup = stats.map(([label, value]) => `<article><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></article>`).join('');
  const navMarkup = nav
    .map((item, index) => `<button type="button" data-screen="${index}" class="${index === 0 ? 'active' : ''}">${escapeHtml(item)}</button>`)
    .join('');
  const activityMarkup = cards
    .map(
      ([title, detail, meta], index) => `<li>
        <i></i>
        <div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span></div>
        <em>${escapeHtml(meta)}</em>
      </li>`
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${appName}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 100%; min-height: 100%; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: ${palette.soft}; color: ${palette.deep}; }
    button { font: inherit; }
    .app { min-height: 100vh; display: grid; grid-template-rows: auto 1fr auto; background:
      radial-gradient(circle at 82% 2%, ${palette.tint}, transparent 28%),
      linear-gradient(180deg, rgba(255,255,255,.88), rgba(255,255,255,.42) 38%, rgba(255,255,255,.96)),
      ${palette.soft}; }
    .top { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px; }
    .brand { display: flex; align-items: center; gap: 11px; min-width: 0; font-weight: 950; letter-spacing: 0; }
    .brand span { width: 40px; height: 40px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 15px; color: white; background: ${palette.accent}; box-shadow: 0 14px 30px color-mix(in srgb, ${palette.accent} 32%, transparent); }
    .top-actions { display: flex; align-items: center; gap: 9px; }
    .icon-btn, .avatar { width: 40px; height: 40px; border: 1px solid rgba(15,23,42,.1); border-radius: 15px; background: rgba(255,255,255,.8); color: ${palette.deep}; display: grid; place-items: center; font-size: 12px; font-weight: 950; }
    .screen { display: none; min-height: 0; padding: 0 18px 18px; animation: rise .22s ease-out; }
    .screen.active { display: grid; gap: 14px; align-content: start; }
    @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    .hero-card { position: relative; overflow: hidden; border-radius: 32px; padding: 24px; color: #fff; background:
      linear-gradient(135deg, color-mix(in srgb, ${palette.accent} 92%, black), ${palette.deep}); box-shadow: 0 24px 60px rgba(15,23,42,.18); }
    .hero-card:after { content: ""; position: absolute; width: 220px; height: 220px; right: -70px; top: -70px; border-radius: 999px; border: 34px solid rgba(255,255,255,.14); }
    .hero-card h1 { position: relative; z-index: 1; margin: 28px 0 12px; max-width: 11ch; font-size: clamp(44px, 13vw, 76px); line-height: .88; letter-spacing: 0; }
    .hero-card p { position: relative; z-index: 1; margin: 0; max-width: 56ch; color: rgba(255,255,255,.74); line-height: 1.45; }
    .hero-meta { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .hero-meta strong { font-size: 13px; text-transform: uppercase; letter-spacing: .08em; }
    .live-chip { border: 1px solid rgba(255,255,255,.25); border-radius: 999px; padding: 8px 11px; background: rgba(255,255,255,.12); font-size: 12px; font-weight: 900; }
    .cta-row { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 22px; }
    .cta-row button { min-height: 52px; border: 0; border-radius: 18px; font-size: 14px; font-weight: 950; }
    .primary { color: ${palette.deep}; background: #fff; }
    .secondary { color: #fff; background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.18) !important; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; }
    .stats article, .panel, .work-card, .insight, .profile-card { border: 1px solid rgba(15,23,42,.08); background: rgba(255,255,255,.86); box-shadow: 0 14px 34px rgba(15,23,42,.07); backdrop-filter: blur(16px); }
    .stats article { min-height: 84px; border-radius: 22px; padding: 15px 12px; }
    .stats strong { display: block; font-size: 24px; line-height: 1; }
    .stats span { display: block; margin-top: 7px; color: color-mix(in srgb, ${palette.deep} 56%, white); font-size: 11px; font-weight: 900; }
    .section-head { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-top: 4px; }
    .section-head h2 { margin: 0; font-size: 23px; line-height: 1; }
    .section-head span { color: ${palette.accent}; font-size: 12px; font-weight: 950; }
    .work-list { display: grid; gap: 11px; }
    .work-card { width: 100%; min-height: 102px; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 13px; border-radius: 24px; padding: 15px; text-align: left; color: ${palette.deep}; }
    .work-card.hot { color: #fff; background: linear-gradient(135deg, ${palette.deep}, color-mix(in srgb, ${palette.accent} 74%, black)); }
    .card-index { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 14px; background: ${palette.tint}; color: ${palette.accent}; font-weight: 950; }
    .hot .card-index { background: rgba(255,255,255,.16); color: #fff; }
    .card-body strong { display: block; font-size: 17px; }
    .card-body small { display: block; margin-top: 5px; color: inherit; opacity: .66; line-height: 1.32; font-size: 13px; }
    .work-card em { border-radius: 999px; padding: 8px 10px; background: ${palette.tint}; color: ${palette.accent}; font-size: 12px; font-style: normal; font-weight: 950; }
    .hot em { background: rgba(255,255,255,.14); color: #fff; }
    .panel { border-radius: 28px; padding: 18px; display: grid; gap: 14px; }
    .timeline { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
    .timeline li { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; }
    .timeline i { width: 12px; height: 12px; border-radius: 50%; background: ${palette.accent}; box-shadow: 0 0 0 6px ${palette.tint}; }
    .timeline strong { display: block; }
    .timeline span { display: block; margin-top: 3px; color: color-mix(in srgb, ${palette.deep} 56%, white); font-size: 13px; line-height: 1.35; }
    .timeline em { color: ${palette.accent}; font-style: normal; font-size: 12px; font-weight: 950; }
    .chart { height: 190px; display: grid; grid-template-columns: repeat(7, 1fr); align-items: end; gap: 9px; padding-top: 16px; }
    .chart span { display: block; border-radius: 999px 999px 10px 10px; background: linear-gradient(180deg, ${palette.accent}, ${palette.deep}); min-height: 34px; }
    .chart span:nth-child(1) { height: 45%; } .chart span:nth-child(2) { height: 70%; } .chart span:nth-child(3) { height: 58%; } .chart span:nth-child(4) { height: 88%; } .chart span:nth-child(5) { height: 64%; } .chart span:nth-child(6) { height: 78%; } .chart span:nth-child(7) { height: 52%; }
    .inbox-grid { display: grid; gap: 11px; }
    .insight { border-radius: 24px; padding: 16px; display: grid; gap: 8px; }
    .insight strong { font-size: 16px; }
    .insight p { margin: 0; color: color-mix(in srgb, ${palette.deep} 60%, white); line-height: 1.4; }
    .profile-card { border-radius: 30px; padding: 22px; display: grid; gap: 14px; }
    .profile-top { display: flex; align-items: center; gap: 14px; }
    .profile-avatar { width: 62px; height: 62px; border-radius: 22px; display: grid; place-items: center; color: white; background: ${palette.deep}; font-size: 18px; font-weight: 950; }
    .profile-card h2, .profile-card p { margin: 0; }
    .settings-list { display: grid; gap: 8px; }
    .settings-list button { min-height: 52px; border: 1px solid rgba(15,23,42,.08); border-radius: 18px; background: #fff; color: ${palette.deep}; text-align: left; padding: 0 14px; font-weight: 900; }
    .toast { position: fixed; left: 18px; right: 18px; bottom: 84px; z-index: 5; transform: translateY(18px); opacity: 0; pointer-events: none; transition: .22s ease; border-radius: 18px; padding: 14px 16px; color: #fff; background: ${palette.deep}; box-shadow: 0 18px 42px rgba(15,23,42,.24); font-weight: 850; }
    .toast.show { transform: none; opacity: 1; }
    .nav { position: sticky; bottom: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; padding: 10px 12px 14px; background: rgba(255,255,255,.84); backdrop-filter: blur(18px); border-top: 1px solid rgba(15,23,42,.08); }
    .nav button { min-height: 45px; border: 0; border-radius: 16px; background: transparent; color: color-mix(in srgb, ${palette.deep} 58%, white); font-size: 12px; font-weight: 950; }
    .nav button.active { color: #fff; background: ${palette.deep}; }
    @media (min-width: 860px) {
      body { background: ${palette.deep}; }
      .app { max-width: 1220px; min-height: 100vh; margin: 0 auto; grid-template-columns: 1fr 1.12fr; grid-template-rows: auto 1fr; column-gap: 10px; padding: 18px; }
      .top { grid-column: 1 / -1; padding: 0 0 14px; color: #fff; }
      .icon-btn, .avatar { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.14); color: #fff; }
      .screen { padding: 0; }
      .screen.active { grid-column: 1 / -1; grid-template-columns: .9fr 1.1fr; gap: 14px; align-content: stretch; }
      .hero-card { min-height: 520px; align-content: end; display: grid; }
      .desktop-stack { display: grid; gap: 14px; }
      .nav { position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%); width: min(520px, calc(100vw - 36px)); border: 1px solid rgba(255,255,255,.16); border-radius: 24px; box-shadow: 0 24px 60px rgba(0,0,0,.28); }
      .toast { left: 50%; right: auto; width: min(420px, calc(100vw - 36px)); transform: translate(-50%, 18px); }
      .toast.show { transform: translate(-50%, 0); }
    }
  </style>
</head>
<body>
  <main class="app">
    <header class="top">
      <div class="brand"><span>${escapeHtml(rawAppName.slice(0, 1))}</span>${appName}</div>
      <div class="top-actions">
        <button class="icon-btn" type="button" data-action="Search opened">⌕</button>
        <div class="avatar">${escapeHtml(rawAppName.slice(0, 2).toUpperCase())}</div>
      </div>
    </header>
    <section class="screen active" data-view="0">
      <div class="hero-card">
        <div class="hero-meta"><strong>${escapeHtml(domain)}</strong><span class="live-chip">Live workspace</span></div>
        <h1>${escapeHtml(data.headline)}</h1>
        <p>${escapeHtml(data.subhead)}</p>
        <div class="cta-row">
          <button class="primary" type="button" data-action="${escapeHtml(data.primary)}">${escapeHtml(data.primary)}</button>
          <button class="secondary" type="button" data-action="${escapeHtml(data.secondary)}">${escapeHtml(data.secondary)}</button>
        </div>
      </div>
      <div class="desktop-stack">
        <section class="stats">${statMarkup}</section>
        <div class="section-head"><h2>Live right now</h2><span>auto-prioritized</span></div>
        <div class="work-list">${cardMarkup}</div>
      </div>
    </section>
    <section class="screen" data-view="1">
      <div class="panel">
        <div class="section-head"><h2>Workflow control</h2><span>${escapeHtml(data.primary)}</span></div>
        <ul class="timeline">${activityMarkup}</ul>
      </div>
      <div class="panel">
        <div class="section-head"><h2>Momentum</h2><span>7 day view</span></div>
        <div class="chart"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
      </div>
    </section>
    <section class="screen" data-view="2">
      <div class="panel">
        <div class="section-head"><h2>Priority inbox</h2><span>triaged</span></div>
        <div class="inbox-grid">
          <article class="insight"><strong>Recommended next move</strong><p>${escapeHtml(cards[0]?.[1] || data.subhead)}</p></article>
          <article class="insight"><strong>Risk to watch</strong><p>${escapeHtml(cards[1]?.[1] || 'One item needs a decision before the flow can close cleanly.')}</p></article>
          <article class="insight"><strong>Ready to send</strong><p>${escapeHtml(cards[2]?.[1] || 'The latest update is packaged for the right user.')}</p></article>
        </div>
      </div>
      <div class="hero-card">
        <div class="hero-meta"><strong>Generated from prompt</strong><span class="live-chip">Real preview</span></div>
        <h1>${escapeHtml(rawAppName)}</h1>
        <p>${escapeHtml(prompt || data.subhead)}</p>
        <div class="cta-row">
          <button class="primary" type="button" data-action="Shared preview">Share Preview</button>
          <button class="secondary" type="button" data-action="Saved draft">Save Draft</button>
        </div>
      </div>
    </section>
    <section class="screen" data-view="3">
      <div class="profile-card">
        <div class="profile-top">
          <div class="profile-avatar">${escapeHtml(rawAppName.slice(0, 2).toUpperCase())}</div>
          <div><h2>${appName}</h2><p>${escapeHtml(domain)} app, preview-ready</p></div>
        </div>
        <section class="stats">${statMarkup}</section>
      </div>
      <div class="panel">
        <div class="section-head"><h2>Settings</h2><span>release aware</span></div>
        <div class="settings-list">
          <button type="button" data-action="Notifications configured">Notifications</button>
          <button type="button" data-action="Roles reviewed">Roles and permissions</button>
          <button type="button" data-action="Export checklist opened">Export checklist</button>
        </div>
      </div>
    </section>
    <nav class="nav">${navMarkup}</nav>
    <div class="toast" id="toast">Action complete</div>
  </main>
  <script>
    const payload = ${safePayload};
    const navButtons = [...document.querySelectorAll('.nav button')];
    const screens = [...document.querySelectorAll('.screen')];
    const toast = document.getElementById('toast');
    function showToast(message) {
      toast.textContent = message + ' in ' + payload.appName;
      toast.classList.add('show');
      window.clearTimeout(showToast.timer);
      showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1600);
    }
    navButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const screenId = button.dataset.screen;
        navButtons.forEach((item) => item.classList.toggle('active', item === button));
        screens.forEach((screen) => screen.classList.toggle('active', screen.dataset.view === screenId));
      });
    });
    document.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => showToast(button.dataset.action));
    });
  </script>
</body>
</html>`;
}
