/**
 * Export Generator — CSS Generation
 *
 * Extracted from exportGenerator.ts for file-size compliance (<800 lines).
 * Generates the full stylesheet for exported PWA/static apps.
 */

export function generateCSS(theme: any): string {
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
