import { AppSpecification } from '@/types/builder';

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] as string);

const safeColor = (value: string, fallback: string) => /^#[0-9A-F]{6}$/i.test(value) ? value : fallback;

export function exportSpecificationAsHtml(specification: AppSpecification) {
  const accent = safeColor(specification.theme.accent, '#A3FF6F');
  const background = safeColor(specification.theme.background, '#080A0C');
  const surface = safeColor(specification.theme.surface, '#12151A');
  const text = safeColor(specification.theme.text, '#F7F8FA');
  const muted = safeColor(specification.theme.muted, '#8A929E');
  const navigation = specification.navigation.map((label, index) =>
    `<a href="#section-${index}">${escapeHtml(label)}</a>`,
  ).join('');
  const sections = specification.sections.map((section, index) => {
    const cards = section.items.map((item) => `<article class="card"><h3>${escapeHtml(item.title)}</h3>${item.value ? `<strong>${escapeHtml(item.value)}</strong>` : ''}<p>${escapeHtml(item.description)}</p>${item.meta ? `<small>${escapeHtml(item.meta)}</small>` : ''}</article>`).join('');
    return `<section id="section-${index}"><p class="eyebrow">${escapeHtml(section.eyebrow)}</p><h2>${escapeHtml(section.title)}</h2><p class="subtitle">${escapeHtml(section.subtitle)}</p><div class="grid">${cards}</div></section>`;
  }).join('');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escapeHtml(specification.summary)}"><title>${escapeHtml(specification.projectName)}</title>
<style>
:root{color-scheme:${specification.theme.mode};--bg:${background};--surface:${surface};--text:${text};--muted:${muted};--accent:${accent};--radius:${Math.max(8, Math.min(specification.theme.radius, 36))}px}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.6 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}header{position:sticky;top:0;background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(16px);border-bottom:1px solid color-mix(in srgb,var(--muted) 20%,transparent);padding:14px max(20px,calc((100vw - 1080px)/2));display:flex;align-items:center;justify-content:space-between;gap:20px}header strong{font-size:18px}nav{display:flex;gap:18px;overflow:auto}a{color:var(--text);text-decoration:none;white-space:nowrap}a:hover{color:var(--accent)}main{max-width:1080px;margin:auto;padding:36px 20px 80px}.hero{padding:70px 0 56px}.eyebrow{color:var(--accent);font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}h1{max-width:850px;margin:10px 0;font-size:clamp(40px,8vw,76px);line-height:1.04;letter-spacing:-.04em}.lead,.subtitle{max-width:720px;color:var(--muted)}section{padding:38px 0;border-top:1px solid color-mix(in srgb,var(--muted) 20%,transparent)}h2{font-size:clamp(28px,5vw,42px);line-height:1.1;margin:6px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:14px;margin-top:24px}.card{min-height:130px;padding:20px;background:var(--surface);border:1px solid color-mix(in srgb,var(--muted) 18%,transparent);border-radius:var(--radius)}.card h3{margin:0 0 10px}.card strong{color:var(--accent);font-size:20px}.card p{color:var(--muted);margin:8px 0}.card small{color:var(--muted)}footer{color:var(--muted);font-size:13px;padding-top:22px}
</style></head><body><header><strong>${escapeHtml(specification.projectName)}</strong><nav>${navigation}</nav></header><main><div class="hero"><p class="eyebrow">${escapeHtml(specification.appType)}</p><h1>${escapeHtml(specification.projectName)}</h1><p class="lead">${escapeHtml(specification.summary)}</p></div>${sections}<footer>Built from a Lotus project draft. Review the content and functionality before publishing.</footer></main></body></html>`;
}

