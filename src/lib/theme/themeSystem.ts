// Theme System — Dual palette: Dark (gold on black) + Light (cream/peach)

export type ThemeMode = 'dark' | 'light';

export interface ThemePalette {
  bgBase: string; bgSurface: string; bgElevated: string; bgSidebar: string;
  bgChat: string; bgCard: string; bgInput: string;
  textPrimary: string; textSecondary: string; textMuted: string; textPlaceholder: string;
  accentPrimary: string; accentPrimaryHover: string; accentPrimaryLight: string;
  accentSecondary: string; accentSecondaryLight: string; accentTertiary: string;
  borderDefault: string; borderHover: string; borderAccent: string;
  statusSuccess: string; statusError: string; statusWarning: string;
  shadowColor: string; overlayColor: string; codeBg: string;
}

export const darkPalette: ThemePalette = {
  bgBase: '#0a0a0a', bgSurface: '#111111', bgElevated: '#1a1a1a', bgSidebar: '#0d0d0d',
  bgChat: '#050505', bgCard: '#141414', bgInput: 'rgba(255,255,255,0.05)',
  textPrimary: '#F5EDE3', textSecondary: 'rgba(245,237,227,0.7)', textMuted: 'rgba(245,237,227,0.4)', textPlaceholder: 'rgba(245,237,227,0.2)',
  accentPrimary: '#E3B26D', accentPrimaryHover: '#EFCA86', accentPrimaryLight: 'rgba(227,178,109,0.1)',
  accentSecondary: '#8CB88F', accentSecondaryLight: 'rgba(140,184,143,0.15)', accentTertiary: '#D4846A',
  borderDefault: 'rgba(255,255,255,0.05)', borderHover: 'rgba(227,178,109,0.2)', borderAccent: 'rgba(227,178,109,0.15)',
  statusSuccess: '#8CB88F', statusError: '#D4846A', statusWarning: '#E3B26D',
  shadowColor: 'rgba(0,0,0,0.5)', overlayColor: 'rgba(0,0,0,0.6)', codeBg: '#141414',
};

export const lightPalette: ThemePalette = {
  bgBase: '#FDF6ED', bgSurface: '#F5EDE3', bgElevated: '#FFFFFF', bgSidebar: '#F8F0E6',
  bgChat: '#FAF3EA', bgCard: '#FFFFFF', bgInput: 'rgba(44,40,36,0.04)',
  textPrimary: '#2C2824', textSecondary: 'rgba(44,40,36,0.65)', textMuted: 'rgba(44,40,36,0.4)', textPlaceholder: 'rgba(44,40,36,0.25)',
  accentPrimary: '#C4795A', accentPrimaryHover: '#D4846A', accentPrimaryLight: 'rgba(196,121,90,0.1)',
  accentSecondary: '#6B9E6E', accentSecondaryLight: 'rgba(107,158,110,0.12)', accentTertiary: '#C4795A',
  borderDefault: 'rgba(44,40,36,0.08)', borderHover: 'rgba(196,121,90,0.25)', borderAccent: 'rgba(196,121,90,0.2)',
  statusSuccess: '#6B9E6E', statusError: '#C4795A', statusWarning: '#C9A050',
  shadowColor: 'rgba(44,40,36,0.06)', overlayColor: 'rgba(44,40,36,0.3)', codeBg: '#F5EDE3',
};

export function getThemePalette(mode: ThemeMode): ThemePalette {
  return mode === 'light' ? lightPalette : darkPalette;
}

export function toggleThemeMode(current: ThemeMode): ThemeMode {
  return current === 'dark' ? 'light' : 'dark';
}
