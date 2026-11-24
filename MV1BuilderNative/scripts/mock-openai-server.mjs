import http from 'node:http';

const item = (title, value, description, meta, icon) => ({ title, value, description, meta, icon });
const result = {
  summary: 'Built a bespoke luminous finance workspace with an editorial hero, live metrics, and a focused growth story.',
  changedSections: ['hero', 'stats', 'chart'],
  specification: {
    projectName: 'Luma Capital',
    appType: 'premium finance workspace',
    summary: 'A confident, high-clarity command center for modern investors.',
    theme: {
      mode: 'dark',
      accent: '#E8FF7A',
      accentSecondary: '#7A8CFF',
      background: '#070806',
      surface: '#13150F',
      text: '#F7F8F2',
      muted: '#92978A',
      radius: 24,
      personality: 'luxury',
    },
    navigation: ['Portfolio', 'Markets', 'Insights', 'Account'],
    sections: [
      {
        id: 'hero-luma',
        type: 'hero',
        eyebrow: 'CAPITAL, CLARIFIED',
        title: 'See the signal. Move with conviction.',
        subtitle: 'A calm, intelligent workspace that turns complex market movement into clear decisions.',
        columns: 1,
        items: [
          item('Open portfolio', 'Primary action', 'Start with your complete market picture.', '', 'arrowUpRight'),
          item('Explore intelligence', 'Secondary action', 'See today’s strongest signals.', 'Live', 'sparkles'),
        ],
      },
      {
        id: 'stats-luma',
        type: 'stats',
        eyebrow: 'PORTFOLIO PULSE',
        title: 'Performance without the noise',
        subtitle: 'A precise view of what changed and why it matters.',
        columns: 4,
        items: [
          item('Net value', '$284.6k', 'Across all connected accounts', '+8.4%', 'wallet'),
          item('Today', '+$3,820', 'Led by technology and energy', '+1.36%', 'activity'),
          item('Yield', '6.8%', 'Twelve-month blended return', '+0.4%', 'trendingUp'),
          item('Risk score', 'Low', 'Diversification remains healthy', 'A+', 'shield'),
        ],
      },
      {
        id: 'chart-luma',
        type: 'chart',
        eyebrow: 'TRAJECTORY',
        title: 'Compounding with intention',
        subtitle: 'Portfolio value over the last six months.',
        columns: 1,
        items: [
          item('Jan', '38', '', '', 'bar'),
          item('Feb', '44', '', '', 'bar'),
          item('Mar', '52', '', '', 'bar'),
          item('Apr', '66', '', '', 'bar'),
          item('May', '74', '', '', 'bar'),
          item('Jun', '92', '', '', 'bar'),
        ],
      },
    ],
  },
};

const port = Number(process.env.MOCK_OPENAI_PORT ?? 4589);
http
  .createServer((request, response) => {
    if (request.method !== 'POST' || request.url !== '/v1/chat/completions') {
      response.writeHead(404).end();
      return;
    }
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      const parsed = JSON.parse(body);
      if (!parsed.response_format?.json_schema?.strict) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: { message: 'Strict schema was not supplied.' } }));
        return;
      }
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify(result) } }] }));
    });
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`Mock OpenAI server listening on http://127.0.0.1:${port}/v1`);
  });
