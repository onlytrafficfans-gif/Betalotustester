// Supabase Auth — Email/password + OAuth (Google, Apple)
import { supabase } from './client';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export async function signUp(email: string, password: string, name?: string): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name || email.split('@')[0] } },
    });
    if (error) return { user: null, error: error.message };
    if (data.user) {
      return { user: { id: data.user.id, email: data.user.email!, name: data.user.user_metadata?.full_name || email.split('@')[0] }, error: null };
    }
  } catch (error) {
    console.error('[LOTUS] signUp failed:', error);
    return { user: null, error: 'Auth service is unavailable. Check Supabase configuration.' };
  }
  return { user: null, error: null };
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };
    if (data.user) {
      return { user: { id: data.user.id, email: data.user.email!, name: data.user.user_metadata?.full_name || data.user.email!.split('@')[0], avatar: data.user.user_metadata?.avatar_url }, error: null };
    }
  } catch (error) {
    console.error('[LOTUS] signIn failed:', error);
    return { user: null, error: 'Auth service is unavailable. Check Supabase configuration.' };
  }
  return { user: null, error: null };
}

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message || null };
  } catch (error) {
    console.error('[LOTUS] Google sign-in failed:', error);
    return { error: 'Auth service is unavailable. Check Supabase configuration.' };
  }
}

export async function signInWithApple(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message || null };
  } catch (error) {
    console.error('[LOTUS] Apple sign-in failed:', error);
    return { error: 'Auth service is unavailable. Check Supabase configuration.' };
  }
}

export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('[LOTUS] signOut failed:', error);
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return null;
    const u = data.session.user;
    return { id: u.id, email: u.email!, name: u.user_metadata?.full_name || u.email!.split('@')[0], avatar: u.user_metadata?.avatar_url };
  } catch (error) {
    console.error('[LOTUS] getCurrentUser failed:', error);
    return null;
  }
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  try {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback({ id: session.user.id, email: session.user.email!, name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0], avatar: session.user.user_metadata?.avatar_url });
      } else {
        callback(null);
      }
    });
    return data.subscription;
  } catch (error) {
    console.error('[LOTUS] onAuthStateChange failed:', error);
    callback(null);
    return { unsubscribe: () => undefined };
  }
}
