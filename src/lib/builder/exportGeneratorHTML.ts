/**
 * Export Generator — HTML Body Generation
 *
 * Extracted from exportGenerator.ts for file-size compliance (<800 lines).
 * Generates the HTML body for exported PWA/static apps.
 *
 * Helpers (getActiveScreen, getComponentValue, escapeHtml, resolveImageSource,
 * renderImageHtml) remain in exportGenerator.ts and are imported below.
 */

import {
  getActiveScreen,
  getComponentValue,
  escapeHtml,
  resolveImageSource,
  renderImageHtml,
} from './exportGenerator';

export function generateHTMLBody(schema: any): string {
  const screen = getActiveScreen(schema);
  if (!screen) return "<div class=\"app-content\"><h1>Welcome</h1></div>";

  const components = screen.components || [];

  let hasBottomNav = components.some((c: any) => c.type === "bottomNav");
  let hasFAB = components.some((c: any) => c.type === "fab");

  const contentComponents = components.filter(
    (c: any) => c.type !== "bottomNav" && c.type !== "fab"
  );

  const renderedContent = contentComponents
    .map((comp: any) => renderHTMLComponent(comp, schema))
    .join("\n    ");

  let html = "";

  // Header
  const header = components.find((c: any) => c.type === "header");
  if (header) {
    html += `
  <header class="app-header">
    ${header.showBackButton ? '<button class="btn-icon">&#8592;</button>' : "<div></div>"}
    <h1>${escapeHtml(header.title)}</h1>
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
function renderHTMLComponent(component: any, schema?: any): string {
  switch (component.type) {
    case "header":
      return ""; // Handled separately

    case "text":
      if (component.variant === "title")
        return `<h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">${escapeHtml(component.content)}</h2>`;
      if (component.variant === "subtitle")
        return `<h3 style="font-size: 18px; font-weight: 600; color: #374151;">${escapeHtml(component.content)}</h3>`;
      if (component.variant === "price")
        return `<p style="font-size: 20px; font-weight: 700; color: var(--primary, #6366f1);">${escapeHtml(component.content)}</p>`;
      return `<p style="font-size: 14px; color: #6b7280; line-height: 1.6;">${escapeHtml(component.content)}</p>`;

    case "button":
      return `<button class="btn btn-${component.variant || "primary"}">${escapeHtml(component.text)}</button>`;

    case "input":
      return `<input type="${component.inputType || "text"}" class="input" placeholder="${escapeHtml(component.placeholder || "")}" />`;

    case "card": {
      const imageSource = resolveImageSource(component, schema);
      return `<div class="card">
  ${imageSource ? `<img src="${escapeHtml(imageSource)}" alt="${escapeHtml(component.title || "Card image")}" class="card-image" style="object-fit: cover;" />` : '<div class="card-image"></div>'}
  <div class="card-body">
    <div class="card-title">${escapeHtml(component.title)}</div>
    ${component.description ? `<div class="card-text">${escapeHtml(component.description)}</div>` : ""}
    ${component.price ? `<div style="margin-top: 8px; font-size: 18px; font-weight: 700; color: var(--primary, #6366f1);">${escapeHtml(component.price)}</div>` : ""}
    ${component.rating ? `<div style="margin-top: 4px;">&#9733; ${component.rating}</div>` : ""}
  </div>
</div>`;
    }

    case "productGrid":
      return `<div class="space-y">
  <h3 style="font-weight: 600;">${component.title || "Products"}</h3>
  <div class="grid-2">
    ${["Wireless Earbuds", "Smart Watch", "Phone Case", "USB Cable"].map((p) => `<div class="card"><div class="card-image"></div><div class="card-body"><div class="card-title">${p}</div><div style="margin-top: 4px; font-weight: 700; color: var(--primary, #6366f1);">$${(Math.random() * 100 + 10).toFixed(2)}</div></div></div>`).join("\n    ")}
  </div>
</div>`;

    case "categoryGrid":
      return `<div class="category-grid">
  ${(component.categories || ["Electronics", "Fashion", "Home", "Sports"]).map((cat: string, i: number) => `<div class="category-item"><div class="category-icon" style="background: hsl(${i * 90}, 70%, 95%);">${escapeHtml(cat[0])}</div><span class="category-label">${escapeHtml(cat)}</span></div>`).join("\n  ")}
</div>`;

    case "searchBar":
      return `<div class="search-bar"><input type="text" placeholder="${escapeHtml(component.placeholder || 'Search...')}" /></div>`;

    case "tabs":
      return `<div class="tabs">
  ${(component.tabs || ["Tab 1", "Tab 2", "Tab 3"]).map((tab: string, i: number) => `<button class="tab ${i === 0 ? "active" : ""}">${escapeHtml(tab)}</button>`).join("\n  ")}
</div>`;

    case "carousel":
      return `<div class="carousel">
  <div class="carousel-track">
    ${(component.items || ["Banner 1", "Banner 2", "Banner 3"]).map((item: string) => `<div class="carousel-slide">${escapeHtml(item)}</div>`).join("\n    ")}
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
  ${(component.stats || [{ label: "Steps", value: "8,432" }, { label: "Cal", value: "420" }, { label: "Min", value: "45" }]).map((stat: any) => `<div class="stat-item"><div class="stat-value">${escapeHtml(stat.value)}</div><div class="stat-label">${escapeHtml(stat.label)}</div></div>`).join("\n  ")}
</div>`;

    case "progressRing":
      return `<div class="progress-ring text-center">
  <svg width="120" height="120" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" stroke-width="8"/>
    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--primary, #6366f1)" stroke-width="8" stroke-linecap="round" stroke-dasharray="314" stroke-dashoffset="${314 - (314 * (component.percentage || 75)) / 100}" style="transition: stroke-dashoffset 1s ease;"/>
  </svg>
  <div style="margin-top: -80px; font-size: 24px; font-weight: 700;">${component.percentage || 75}%</div>
  ${component.title ? `<div style="margin-top: 40px; font-size: 14px; color: #6b7280;">${escapeHtml(component.title)}</div>` : ""}
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
      return `<h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${escapeHtml(component.title)}</h3>`;

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
  ${(component.items || ["Subtotal", "Shipping", "Total"]).map((item: string, i: number) => `<div style="display: flex; justify-content: space-between; margin-bottom: 8px; ${item === "Total" ? "font-weight: 700; font-size: 16px; border-top: 1px solid #e5e7eb; padding-top: 8px;" : "font-size: 14px; color: #6b7280;"}"><span>${escapeHtml(item)}</span><span>${item === "Total" ? "$99.99" : item === "Shipping" ? "Free" : "$0.00"}</span></div>`).join("\n  ")}
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
  ${component.label ? `<label style="display: block; font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; margin-bottom: 6px;">${escapeHtml(component.label)}</label>` : ""}
  <button style="width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #e5e7eb; background: white; text-align: left; font-size: 15px; color: #6b7280; display: flex; align-items: center; justify-content: space-between;">Select date <span style="color: #9ca3af;">&#128197;</span></button>
</div>`;

    case "select":
      return `<div style="margin-bottom: 12px;">
  ${component.label ? `<label style="display: block; font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; margin-bottom: 6px;">${escapeHtml(component.label)}</label>` : ""}
  <button style="width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #e5e7eb; background: white; text-align: left; font-size: 15px; color: #374151; display: flex; align-items: center; justify-content: space-between;">${escapeHtml((component.options || ["Select"])[0])} <span style="color: #9ca3af; transform: rotate(90deg);">&#8250;</span></button>
</div>`;

    case "badge":
      return `<span style="display: inline-flex; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; background: rgba(99,102,241,0.1); color: var(--primary, #6366f1);">${escapeHtml(component.text || "Badge")}</span>`;

    case "avatar":
      return `<div style="display: flex; align-items: center; gap: 12px;">
  <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary, #6366f1), #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">${escapeHtml(component.initials || "U")}</div>
  ${component.name ? `<div><div style="font-weight: 500;">${escapeHtml(component.name)}</div>${component.subtitle ? `<div style="font-size: 12px; color: #6b7280;">${escapeHtml(component.subtitle)}</div>` : ""}</div>` : ""}
</div>`;

    case "image":
      return renderImageHtml(resolveImageSource(component, schema), component.alt || component.title || "Uploaded image", component.height || 200);

    case "imageGallery":
      return renderImageHtml(resolveImageSource(component, schema), component.alt || component.title || "Uploaded image gallery", component.height || 250);

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
