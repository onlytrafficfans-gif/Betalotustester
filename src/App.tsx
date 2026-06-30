// LOTUS App Builder — Auth gate + Builder
import { useState, useEffect, useCallback } from 'react';
import { BuilderLayout } from '@/components/builder/BuilderLayout';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Toaster } from '@/components/ui/sonner';
import { getCurrentUser, onAuthStateChange, signOut } from '@/lib/supabase/auth';
import type { AuthUser } from '@/lib/supabase/auth';
import { LogOut, User } from 'lucide-react';
// Builder layout handles project loading internally

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });

    // Listen for auth changes
    const sub = onAuthStateChange((u) => {
      setUser(u);
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  const handleAuth = useCallback((u: AuthUser) => {
    setUser(u);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthScreen onAuth={handleAuth} />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e5e5' },
          }}
        />
      </>
    );
  }

  return (
    <>
      {/* User bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-7 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/20 font-mono">LOTUS</span>
        </div>
        <div className="flex items-center gap-2">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-4 h-4 rounded-full" />
          ) : (
            <User size={10} className="text-white/30" />
          )}
          <span className="text-[10px] text-white/40 truncate max-w-[120px]">{user.name || user.email}</span>
          <button
            onClick={handleSignOut}
            className="p-1 rounded hover:bg-white/5 text-white/20 hover:text-white/40 transition-all"
            title="Sign out"
          >
            <LogOut size={10} />
          </button>
        </div>
      </div>
      <div className="pt-7 h-screen">
        <BuilderLayout user={user} />
      </div>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e5e5' },
        }}
      />
    </>
  );
}

export default App;
