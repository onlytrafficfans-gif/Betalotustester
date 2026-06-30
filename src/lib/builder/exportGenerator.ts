/**
 * Export Generator
 * 
 * Generates deployable code bundles from app schemas.
 * Supports multiple export formats: PWA, static site, Expo project.
 */

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
  <link rel="apple-touch-icon" href="icon-192.png">
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
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
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
  '/icon-192.png',
  '/icon-512.png'
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
  const { generateExpoProject } = require("./expoExport");
  return generateExpoProject(schema);
}

/**
 * Generate CSS for the app
 */
function generateCSS(theme: any): string {
  const primaryColor = theme.primaryColor || "#6366f1";
  const bgColor = theme.backgroundColor || "#fafafa";

  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: ${bgColor};
  color: #1f2937;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

#app {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  background: ${bgColor};
  position: relative;
}

/* Header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-header h1 {
  font-size: 18px;
  font-weight: 600;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-icon:hover {
  background: #f3f4f6;
}

/* Content */
.app-content {
  padding: 16px;
}

/* Cards */
.card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f3f4f6;
  margin-bottom: 12px;
}

.card-image {
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-body {
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.card-text {
  font-size: 14px;
  color: #6b7280;
}

/* Buttons */
.btn {
  width: 100%;
  padding: 14px 20px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background: ${primaryColor};
  color: white;
}

.btn-outline {
  background: transparent;
  border: 2px solid ${primaryColor};
  color: ${primaryColor};
}

/* Input */
.input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  font-size: 16px;
  outline: none;
  transition: border-color 0.15s;
}

.input:focus {
  border-color: ${primaryColor};
}

/* Search */
.search-bar {
  position: relative;
  margin-bottom: 16px;
}

.search-bar input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border-radius: 12px;
  border: none;
  background: #f3f4f6;
  font-size: 15px;
  outline: none;
}

.search-bar::before {
  content: "";
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.3-4.3'/%3E%3C/svg%3E");
}

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f3f4f6;
  border-radius: 12px;
  margin-bottom: 16px;
}

.tab {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.tab.active {
  background: white;
  color: #1f2937;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Grid */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* Categories */
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.category-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.category-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}

/* Task List */
.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid #f3f4f6;
}

.task-checkbox {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}

.task-checkbox.checked {
  background: ${primaryColor};
  border-color: ${primaryColor};
}

.task-text {
  flex: 1;
  font-size: 14px;
}

.task-text.done {
  text-decoration: line-through;
  color: #9ca3af;
}

/* Stats */
.stats-row {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

/* Progress Ring */
.progress-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
}

.progress-ring svg {
  transform: rotate(-90deg);
}

/* Bottom Nav */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  display: flex;
  justify-content: space-around;
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #e5e7eb;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 12px;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 11px;
  font-weight: 500;
}

.nav-item.active {
  color: ${primaryColor};
}

/* FAB */
.fab {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${primaryColor};
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  cursor: pointer;
}

.fab:active {
  transform: scale(0.9);
}

/* Cart */
.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid #f3f4f6;
}

.cart-thumb {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cart-info {
  flex: 1;
}

.cart-title {
  font-size: 14px;
  font-weight: 500;
}

.cart-price {
  font-size: 16px;
  font-weight: 700;
  color: ${primaryColor};
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Carousel */
.carousel {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  margin-bottom: 16px;
}

.carousel-track {
  display: flex;
  transition: transform 0.5s ease;
}

.carousel-slide {
  min-width: 100%;
  height: 140px;
  background: linear-gradient(135deg, ${primaryColor}20, ${primaryColor}10);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: ${primaryColor};
}

.carousel-dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.carousel-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${primaryColor}40;
}

.carousel-dot.active {
  background: ${primaryColor};
  width: 18px;
  border-radius: 3px;
}

/* Utilities */
.space-y { display: flex; flex-direction: column; gap: 12px; }
.text-center { text-align: center; }
.py-8 { padding-top: 32px; padding-bottom: 32px; }
.text-gray { color: #9ca3af; }
.text-sm { font-size: 14px; }
.font-medium { font-weight: 500; }

@media (max-width: 480px) {
  #app {
    max-width: 100%;
  }
}
`;
}

/**
 * Generate HTML body content from schema
 */
function generateHTMLBody(schema: any): string {
  const screen = schema.screens?.[0];
  if (!screen) return "<div class=\"app-content\"><h1>Welcome</h1></div>";

  const components = screen.components || [];

  let hasBottomNav = components.some((c: any) => c.type === "bottomNav");
  let hasFAB = components.some((c: any) => c.type === "fab");

  const contentComponents = components.filter(
    (c: any) => c.type !== "bottomNav" && c.type !== "fab"
  );

  const renderedContent = contentComponents
    .map((comp: any) => renderHTMLComponent(comp))
    .join("\n    ");

  let html = "";

  // Header
  const header = components.find((c: any) => c.type === "header");
  if (header) {
    html += `
  <header class="app-header">
    ${header.showBackButton ? '<button class="btn-icon">&#8592;</button>' : "<div></div>"}
    <h1>${header.title}</h1>
    ${header.showAddButton ? '<button class="btn-icon">+</button>' : "<div></div>"}
  </header>`;
  }

  html += `
  <main class="app-content">
    ${renderedContent}
  </main>`;

  if (hasFAB) {
    html += `
  <button class="fab">+</button>`;
  }

  if (hasBottomNav) {
    const navItems = [{ icon: "&#8962;", label: "Home" }, { icon: "&#9906;", label: "Search" }, { icon: "&#128722;", label: "Cart" }, { icon: "&#9786;", label: "Profile" }];
    html += `
  <nav class="bottom-nav">
    ${navItems.map((item, i) => `<button class="nav-item ${i === 0 ? "active" : ""}">${item.icon}<span>${item.label}</span></button>`).join("\n    ")}
  </nav>`;
  }

  return html;
}

/**
 * Render a single component to HTML
 */
function renderHTMLComponent(component: any): string {
  switch (component.type) {
    case "header":
      return ""; // Handled separately

    case "text":
      if (component.variant === "title")
        return `<h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">${component.content}</h2>`;
      if (component.variant === "subtitle")
        return `<h3 style="font-size: 18px; font-weight: 600; color: #374151;">${component.content}</h3>`;
      if (component.variant === "price")
        return `<p style="font-size: 20px; font-weight: 700; color: var(--primary, #6366f1);">${component.content}</p>`;
      return `<p style="font-size: 14px; color: #6b7280; line-height: 1.6;">${component.content}</p>`;

    case "button":
      return `<button class="btn btn-${component.variant || "primary"}">${component.text}</button>`;

    case "input":
      return `<input type="${component.inputType || "text"}" class="input" placeholder="${component.placeholder || ""}" />`;

    case "card":
      return `<div class="card">
  <div class="card-image"></div>
  <div class="card-body">
    <div class="card-title">${component.title}</div>
    ${component.description ? `<div class="card-text">${component.description}</div>` : ""}
    ${component.price ? `<div style="margin-top: 8px; font-size: 18px; font-weight: 700; color: var(--primary, #6366f1);">${component.price}</div>` : ""}
    ${component.rating ? `<div style="margin-top: 4px;">&#9733; ${component.rating}</div>` : ""}
  </div>
</div>`;

    case "productGrid":
      return `<div class="space-y">
  <h3 style="font-weight: 600;">${component.title || "Products"}</h3>
  <div class="grid-2">
    ${["Wireless Earbuds", "Smart Watch", "Phone Case", "USB Cable"].map((p) => `<div class="card"><div class="card-image"></div><div class="card-body"><div class="card-title">${p}</div><div style="margin-top: 4px; font-weight: 700; color: var(--primary, #6366f1);">$${(Math.random() * 100 + 10).toFixed(2)}</div></div></div>`).join("\n    ")}
  </div>
</div>`;

    case "categoryGrid":
      return `<div class="category-grid">
  ${(component.categories || ["Electronics", "Fashion", "Home", "Sports"]).map((cat: string, i: number) => `<div class="category-item"><div class="category-icon" style="background: hsl(${i * 90}, 70%, 95%);">${cat[0]}</div><span class="category-label">${cat}</span></div>`).join("\n  ")}
</div>`;

    case "searchBar":
      return `<div class="search-bar"><input type="text" placeholder="${component.placeholder || "Search..."}" /></div>`;

    case "tabs":
      return `<div class="tabs">
  ${(component.tabs || ["Tab 1", "Tab 2", "Tab 3"]).map((tab: string, i: number) => `<button class="tab ${i === 0 ? "active" : ""}">${tab}</button>`).join("\n  ")}
</div>`;

    case "carousel":
      return `<div class="carousel">
  <div class="carousel-track">
    ${(component.items || ["Banner 1", "Banner 2", "Banner 3"]).map((item: string) => `<div class="carousel-slide">${item}</div>`).join("\n    ")}
  </div>
  <div class="carousel-dots">
    ${(component.items || ["", "", ""]).map((_: string, i: number) => `<div class="carousel-dot ${i === 0 ? "active" : ""}"></div>`).join("\n    ")}
  </div>
</div>`;

    case "taskList":
      return `<div class="space-y">
  ${["Review mockups", "Update docs", "Fix nav bug"].map((task, i) => `<div class="task-item"><div class="task-checkbox ${i === 1 ? "checked" : ""}">${i === 1 ? "&#10003;" : ""}</div><span class="task-text ${i === 1 ? "done" : ""}">${task}</span></div>`).join("\n  ")}
</div>`;

    case "statsRow":
      return `<div class="stats-row">
  ${(component.stats || [{ label: "Steps", value: "8,432" }, { label: "Cal", value: "420" }, { label: "Min", value: "45" }]).map((stat: any) => `<div class="stat-item"><div class="stat-value">${stat.value}</div><div class="stat-label">${stat.label}</div></div>`).join("\n  ")}
</div>`;

    case "progressRing":
      return `<div class="progress-ring text-center">
  <svg width="120" height="120" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" stroke-width="8"/>
    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--primary, #6366f1)" stroke-width="8" stroke-linecap="round" stroke-dasharray="314" stroke-dashoffset="${314 - (314 * (component.percentage || 75)) / 100}" style="transition: stroke-dashoffset 1s ease;"/>
  </svg>
  <div style="margin-top: -80px; font-size: 24px; font-weight: 700;">${component.percentage || 75}%</div>
  ${component.title ? `<div style="margin-top: 40px; font-size: 14px; color: #6b7280;">${component.title}</div>` : ""}
</div>`;

    case "chart":
      return `<div style="height: 180px; background: linear-gradient(135deg, rgba(99,102,241,0.05), rgba(99,102,241,0.1)); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
  <span style="color: var(--primary, #6366f1); font-size: 14px;">[Chart Placeholder]</span>
</div>`;

    case "bottomNav":
    case "fab":
      return ""; // Handled separately

    case "divider":
      return "<hr style=\"border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;\" />";

    case "sectionTitle":
      return `<h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${component.title}</h3>`;

    case "workoutList":
      return `<div class="space-y">
  ${["Morning Run", "Upper Body"].map((w, i) => `<div class="task-item"><div style="width: 40px; height: 40px; border-radius: 10px; background: ${i === 1 ? "#d1fae5" : "rgba(99,102,241,0.1)"}; display: flex; align-items: center; justify-content: center; color: ${i === 1 ? "#059669" : "var(--primary, #6366f1)"}; font-weight: 600;">${i === 1 ? "&#10003;" : "&#127947;"}</div><div style="flex: 1;"><div style="font-weight: 500;">${w}</div><div style="font-size: 12px; color: #6b7280;">${i === 0 ? "30 min · 320 cal" : "45 min · 280 cal"}</div></div></div>`).join("\n  ")}
</div>`;

    case "cartList":
      return `<div class="space-y">
  ${["Wireless Earbuds", "Phone Case"].map((item, i) => `<div class="cart-item"><div class="cart-thumb"></div><div class="cart-info"><div class="cart-title">${item}</div><div class="cart-price">$${i === 0 ? "79.99" : "24.99"}</div></div><div class="qty-control"><button class="qty-btn">-</button><span style="font-size: 14px; font-weight: 500;">${i === 0 ? 1 : 2}</span><button class="qty-btn">+</button></div></div>`).join("\n  ")}
</div>`;

    case "summary":
      return `<div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px;">
  ${(component.items || ["Subtotal", "Shipping", "Total"]).map((item: string, i: number) => `<div style="display: flex; justify-content: space-between; margin-bottom: 8px; ${item === "Total" ? "font-weight: 700; font-size: 16px; border-top: 1px solid #e5e7eb; padding-top: 8px;" : "font-size: 14px; color: #6b7280;"}"><span>${item}</span><span>${item === "Total" ? "$99.99" : item === "Shipping" ? "Free" : "$0.00"}</span></div>`).join("\n  ")}
</div>`;

    case "timer":
      return `<div style="text-align: center; padding: 32px 0;">
  <div style="font-size: 56px; font-family: monospace; font-weight: 700; letter-spacing: 4px;">00:00</div>
  <div style="display: flex; justify-content: center; gap: 16px; margin-top: 24px;">
    <button style="width: 56px; height: 56px; border-radius: 50%; border: none; background: var(--primary, #6366f1); color: white; font-size: 20px; cursor: pointer;">&#9654;</button>
    <button style="width: 56px; height: 56px; border-radius: 50%; border: none; background: #e5e7eb; color: #6b7280; font-size: 20px; cursor: pointer;">&#9208;</button>
    <button style="width: 56px; height: 56px; border-radius: 50%; border: none; background: #e5e7eb; color: #6b7280; font-size: 18px; cursor: pointer;">&#8634;</button>
  </div>
</div>`;

    case "exerciseList":
      return `<div class="space-y">
  ${["Push-ups", "Squats", "Plank"].map((ex, i) => `<div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: white; border-radius: 12px; border: 1px solid #f3f4f6;"><div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(99,102,241,0.1); display: flex; align-items: center; justify-content: center; color: var(--primary, #6366f1); font-weight: 700; font-size: 14px;">${i + 1}</div><span style="flex: 1; font-weight: 500;">${ex}</span>${component.showCheckboxes ? '<div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid #d1d5db;"></div>' : ""}</div>`).join("\n  ")}
</div>`;

    case "rating":
      return `<div style="display: flex; gap: 4px;">
  ${[1, 2, 3, 4, 5].map((star) => `<span style="font-size: 20px; color: ${star <= (component.value || 0) ? "#fbbf24" : "#e5e7eb"};">&#9733;</span>`).join("")}
</div>`;

    case "datePicker":
      return `<div style="margin-bottom: 12px;">
  ${component.label ? `<label style="display: block; font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; margin-bottom: 6px;">${component.label}</label>` : ""}
  <button style="width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #e5e7eb; background: white; text-align: left; font-size: 15px; color: #6b7280; display: flex; align-items: center; justify-content: space-between;">Select date <span style="color: #9ca3af;">&#128197;</span></button>
</div>`;

    case "select":
      return `<div style="margin-bottom: 12px;">
  ${component.label ? `<label style="display: block; font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; margin-bottom: 6px;">${component.label}</label>` : ""}
  <button style="width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #e5e7eb; background: white; text-align: left; font-size: 15px; color: #374151; display: flex; align-items: center; justify-content: space-between;">${(component.options || ["Select"])[0]} <span style="color: #9ca3af; transform: rotate(90deg);">&#8250;</span></button>
</div>`;

    case "badge":
      return `<span style="display: inline-flex; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; background: rgba(99,102,241,0.1); color: var(--primary, #6366f1);">${component.text || "Badge"}</span>`;

    case "avatar":
      return `<div style="display: flex; align-items: center; gap: 12px;">
  <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary, #6366f1), #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">${component.initials || "U"}</div>
  ${component.name ? `<div><div style="font-weight: 500;">${component.name}</div>${component.subtitle ? `<div style="font-size: 12px; color: #6b7280;">${component.subtitle}</div>` : ""}</div>` : ""}
</div>`;

    case "image":
      return `<div style="width: 100%; height: 200px; background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #9ca3af; margin-bottom: 12px;">[Image]</div>`;

    case "imageGallery":
      return `<div style="width: 100%; height: ${component.height || 250}px; background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #9ca3af; margin-bottom: 12px;">[Image Gallery]</div>`;

    case "list":
      return `<div style="border-top: 1px solid #f3f4f6;">
  ${(component.items || ["Item 1", "Item 2", "Item 3"]).map((item: string) => `<div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6;"><span style="font-size: 14px;">${item}</span><span style="color: #d1d5db;">&#8250;</span></div>`).join("\n  ")}
</div>`;

    default:
      return `<div style="padding: 12px; background: #fef9c3; border-radius: 8px; font-size: 12px; color: #854d0e;">Unknown: ${component.type}</div>`;
  }
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
