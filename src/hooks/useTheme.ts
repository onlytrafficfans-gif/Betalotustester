// useTheme hook — Dual dark/light mode synced to Supabase user_profiles
import { useState, useEffect, useCallback } from 'react';
import { getThemePalette, type ThemeMode } from '@/lib/theme/themeSystem';
import { getThemeMode, setThemeMode } from '@/lib/supabase/profileStorage';

export function useTheme(userId?: string) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    if (!userId) return;
    getThemeMode(userId).then(setMode);
  }, [userId]);

  useEffect(() => {
    const palette = getThemePalette(mode);
    const css = `:root{--lotus-bg-base:${palette.bgBase};--lotus-bg-surface:${palette.bgSurface};--lotus-bg-elevated:${palette.bgElevated};--lotus-bg-sidebar:${palette.bgSidebar};--lotus-bg-chat:${palette.bgChat};--lotus-bg-card:${palette.bgCard};--lotus-bg-input:${palette.bgInput};--lotus-text-primary:${palette.textPrimary};--lotus-text-secondary:${palette.textSecondary};--lotus-text-muted:${palette.textMuted};--lotus-text-placeholder:${palette.textPlaceholder};--lotus-accent-primary:${palette.accentPrimary};--lotus-accent-primary-hover:${palette.accentPrimaryHover};--lotus-accent-primary-light:${palette.accentPrimaryLight};--lotus-accent-secondary:${palette.accentSecondary};--lotus-accent-secondary-light:${palette.accentSecondaryLight};--lotus-accent-tertiary:${palette.accentTertiary};--lotus-border-default:${palette.borderDefault};--lotus-border-hover:${palette.borderHover};--lotus-border-accent:${palette.borderAccent};--lotus-status-success:${palette.statusSuccess};--lotus-status-error:${palette.statusError};--lotus-status-warning:${palette.statusWarning};--lotus-shadow-color:${palette.shadowColor};--lotus-overlay-color:${palette.overlayColor};--lotus-code-bg:${palette.codeBg};}`;
    const el = document.getElementById('lotus-theme') || document.createElement('style');
    el.id = 'lotus-theme';
    el.textContent = css;
    if (!document.getElementById('lotus-theme')) document.head.appendChild(el);
  }, [mode]);

  const toggle = useCallback(() => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    if (userId) setThemeMode(userId, next);
  }, [mode, userId]);

  return { mode, toggle };
}
