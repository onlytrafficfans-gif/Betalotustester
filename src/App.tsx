// LOTUS App Builder — Auth gate + Builder
import { useState, useEffect, useCallback } from 'react';
import { BuilderLayout } from '@/components/builder/BuilderLayout';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Toaster } from '@/components/ui/sonner';
import { getCurrentUser, onAuthStateChange } from '@/lib/supabase/auth';
import type { AuthUser } from '@/lib/supabase/auth';
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
      <div className="h-screen overflow-hidden">
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
