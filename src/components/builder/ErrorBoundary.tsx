// ErrorBoundary — Catch errors in the builder

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#050505] px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h2 className="text-base font-semibold text-white/80 mb-2">Something went wrong</h2>
          <p className="text-xs text-white/30 max-w-xs mb-1">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-all"
          >
            <RotateCcw size={12} /> Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
