/**
 * Export Generator
 * 
 * Generates deployable code bundles from app schemas.
 * Supports multiple export formats: PWA, static site, Expo project.
 */
import { generateExpoProject } from './expoExport';
import { generateCSS } from "./exportGeneratorCSS";
import { generateHTMLBody } from "./exportGeneratorHTML";

export type ExportFormat = "pwa" | "static" | "expo";

interface ExportOptions {
  format: ExportFormat;
  includeSourceMap?: boolean;
  minify?: boolean;
}

interface ExportFile {
  path: string;
  content: string;
}

export function getActiveScreen(schema: any) {
  if (!Array.isArray(schema?.screens) || schema.screens.length === 0) return null;
  return (
    schema.screens.find((screen: any) => screen.id === schema.activeScreenId) ||
    schema.screens.find((screen: any) => screen.name === schema.activeScreenId) ||
    schema.screens[0]
  );
}

export function getComponentValue(component: any, field: string) {
  return component?.[field] ?? component?.props?.[field];
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function resolveImageSource(component: any, schema: any): string | undefined {
  const direct = getComponentValue(component, "src");
  if (typeof direct === "string" && direct.startsWith("data:")) return direct;

  const image = getComponentValue(component, "image");
  if (typeof image === "string" && image.startsWith("data:")) return image;

  const assetId =
    getComponentValue(component, "assetId") ||
    getComponentValue(component, "imageAssetId") ||
    (typeof direct === "string" ? direct : undefined) ||
    (typeof image === "string" ? image : undefined);

  const asset = schema?.imageAssets?.find((item: any) => item.id === assetId || item.name === assetId);
  return asset?.dataUrl;
}

export function renderImageHtml(src: string | undefined, alt: string, height: number): string {
  if (src) {
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="width: 100%; height: ${height}px; object-fit: cover; border-radius: 16px; background: #f3f4f6; margin-bottom: 12px;" />`;
  }
  return `<div style="width: 100%; height: ${height}px; background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #9ca3af; margin-bottom: 12px;">[Image]</div>`;
}

function generateIconSvg(appName: string, theme: any): string {
  const primaryColor = escapeHtml(theme.primaryColor || "#6366f1");
  const label = escapeHtml((appName || "L").trim().slice(0, 1).toUpperCase());
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#0a0a0a"/>
  <circle cx="256" cy="256" r="164" fill="${primaryColor}" opacity="0.18"/>
  <path d="M256 104c58 58 88 110 88 156 0 55-40 94-88 94s-88-39-88-94c0-46 30-98 88-156z" fill="${primaryColor}"/>
  <text x="256" y="425" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="700" fill="#fff">${label}</text>
</svg>`;
}

/**
 * Generate a complete export package for an app schema
 */
export function generateExport(
  schema: any,
  options: ExportOptions
): ExportFile[] {
  switch (options.format) {
    case "pwa":
      return generatePWAExport(schema);
    case "static":
      return generateStaticExport(schema);
    case "expo":
      return generateExpoExport(schema);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

/**
 * Generate PWA export - ready to deploy as a Progressive Web App
 */
function generatePWAExport(schema: any): ExportFile[] {
  const files: ExportFile[] = [];
  const appName = schema.name || "MyApp";
  const theme = schema.theme || {};

  // index.html
  files.push({
    path: "index.html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="${theme.primaryColor || "#6366f1"}">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>${appName}</title>
  <link rel="manifest" href="manifest.json">
  <link rel="icon" href="icon.svg" type="image/svg+xml">
  <style>
    ${generateCSS(theme)}
  </style>
</head>
<body>
  <div id="app">
    ${generateHTMLBody(schema)}
  </div>
  <script>
    ${generateJavaScript(schema)}
  </script>
  <script>
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js');
    }
  </script>
</body>
</html>`,
  });

  // manifest.json
  files.push({
    path: "manifest.json",
    content: JSON.stringify(
      {
        name: appName,
        short_name: appName,
        start_url: ".",
        display: "standalone",
        background_color: theme.backgroundColor || "#ffffff",
        theme_color: theme.primaryColor || "#6366f1",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
        ],
      },
      null,
      2
    ),
  });

  // Service Worker
  files.push({
    path: "sw.js",
    content: `const CACHE_NAME = '${appName.toLowerCase().replace(/\s+/g, "-")}-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) return response;
        return fetch(event.request);
      })
  );
});
`,
  });

  files.push({
    path: "icon.svg",
    content: generateIconSvg(appName, theme),
  });

  return files;
}

/**
 * Generate static site export
 */
function generateStaticExport(schema: any): ExportFile[] {
  // Static export is similar to PWA but without service worker
  const files = generatePWAExport(schema);

  // Remove service worker from index.html
  const htmlFile = files.find((f) => f.path === "index.html");
  if (htmlFile) {
    htmlFile.content = htmlFile.content.replace(
      /<script>\s*\/\/ Service Worker Registration[\s\S]*?<\/script>/,
      ""
    );
  }

  // Remove sw.js
  return files.filter((f) => f.path !== "sw.js");
}

/**
 * Generate Expo project export
 */
function generateExpoExport(schema: any): ExportFile[] {
  return generateExpoProject(schema);
}


/**
 * Generate JavaScript interactivity
 */
function generateJavaScript(schema: any): string {
  return `
// Tab switching
document.querySelectorAll('.tabs').forEach(tabs => {
  tabs.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
});

// Task toggling
document.querySelectorAll('.task-checkbox').forEach(checkbox => {
  checkbox.addEventListener('click', () => {
    checkbox.classList.toggle('checked');
    const text = checkbox.nextElementSibling;
    if (text) text.classList.toggle('done');
    if (checkbox.classList.contains('checked')) {
      checkbox.innerHTML = '&#10003;';
    } else {
      checkbox.innerHTML = '';
    }
  });
});

// Bottom nav
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

// Carousel auto-play
document.querySelectorAll('.carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const dots = carousel.querySelectorAll('.carousel-dot');
  let current = 0;
  const slides = track.children.length;

  if (slides > 1) {
    setInterval(() => {
      current = (current + 1) % slides;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }, 4000);
  }
});
`;
}

/**
 * Download all files as a zip
 */
export function downloadExport(files: ExportFile[], filename: string): void {
  // In browser environment, trigger downloads
  if (typeof window !== "undefined") {
    files.forEach((file) => {
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.path;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}

export function generateExportFiles(schema: any, format: ExportFormat = 'pwa'): ExportFile[] {
  return generateExport(schema, { format });
}

export async function exportToZip(files: ExportFile[], filename: string): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  files.forEach((file) => zip.file(file.path, file.content));
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename || 'lotus-export'}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}
