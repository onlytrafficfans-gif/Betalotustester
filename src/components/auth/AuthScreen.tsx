// AuthScreen — Login / Signup with email/password + Google + Apple OAuth

import { useState, useCallback } from 'react';
import { signUp, signIn, signInWithGoogle, signInWithApple } from '@/lib/supabase/auth';
import { Mail, Lock, User, Chrome, Apple, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AuthScreenProps {
  onAuth: (user: { id: string; email: string; name?: string; avatar?: string }) => void;
}

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (mode === 'signup') {
      const { user, error } = await signUp(email, password, name);
      if (error) {
        setError(error);
      } else if (user) {
        onAuth(user);
      }
    } else {
      const { user, error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else if (user) {
        onAuth(user);
      }
    }
    setLoading(false);
  }, [mode, email, password, name, onAuth]);

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) setError(error);
  };

  const handleApple = async () => {
    const { error } = await signInWithApple();
    if (error) setError(error);
  };

  const isValid = email.includes('@') && password.length >= 6 && (mode === 'login' || name.length >= 2);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-lotus-400/20 bg-lotus-400/10 flex items-center justify-center">
            <span className="text-xs font-bold text-lotus-400">L</span>
            <img src="/logo-lotus.png" alt="LOTUS" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white/90 tracking-tight">LOTUS</h1>
            <p className="text-xs text-white/30 mt-0.5">Build apps with AI</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
          {/* Tabs */}
          <div className="flex rounded-lg bg-white/5 p-0.5">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${mode === 'login' ? 'bg-lotus-400/15 text-lotus-400' : 'text-white/30 hover:text-white/50'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${mode === 'signup' ? 'bg-lotus-400/15 text-lotus-400' : 'text-white/30 hover:text-white/50'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Name (signup only) */}
          {mode === 'signup' && (
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-lotus-400/30"
              />
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-lotus-400/30"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6)"
              className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-lotus-400/30"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle size={12} className="text-red-400 shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-lotus-600 hover:bg-lotus-400 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={14} />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] text-white/20 uppercase">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* OAuth */}
          <div className="flex gap-2">
            <button
              onClick={handleGoogle}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-xs text-white/50 hover:bg-white/[0.05] hover:text-white/70 transition-all"
            >
              <Chrome size={14} />
              <span className="hidden sm:inline">Google</span>
            </button>
            <button
              onClick={handleApple}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-xs text-white/50 hover:bg-white/[0.05] hover:text-white/70 transition-all"
            >
              <Apple size={14} />
              <span className="hidden sm:inline">Apple</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-white/15">
          By signing in, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
