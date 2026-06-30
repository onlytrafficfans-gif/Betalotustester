// Supabase Auth — Email/password + OAuth (Google, Apple)
import { supabase } from './client';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export async function signUp(email: string, password: string, name?: string): Promise<{ user: AuthUser | null; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name || email.split('@')[0] } },
  });
  if (error) return { user: null, error: error.message };
  if (data.user) {
    return { user: { id: data.user.id, email: data.user.email!, name: data.user.user_metadata?.full_name || email.split('@')[0] }, error: null };
  }
  return { user: null, error: null };
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };
  if (data.user) {
    return { user: { id: data.user.id, email: data.user.email!, name: data.user.user_metadata?.full_name || data.user.email!.split('@')[0], avatar: data.user.user_metadata?.avatar_url }, error: null };
  }
  return { user: null, error: null };
}

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  return { error: error?.message || null };
}

export async function signInWithApple(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  return { error: error?.message || null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;
  const u = data.session.user;
  return { id: u.id, email: u.email!, name: u.user_metadata?.full_name || u.email!.split('@')[0], avatar: u.user_metadata?.avatar_url };
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({ id: session.user.id, email: session.user.email!, name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0], avatar: session.user.user_metadata?.avatar_url });
    } else {
      callback(null);
    }
  });
  return data.subscription;
}
