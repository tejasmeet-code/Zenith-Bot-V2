import React from 'react';
import { DISCORD_EMOJIS } from '../utils/discordEmojis.ts';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ZENITH UI ERROR BOUNDARY]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080C] text-[#F4F6FB] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#0E1017] border border-red-500/30 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex justify-center">
              <img
                src={DISCORD_EMOJIS.ERROR.url}
                alt="Error"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h2 className="text-lg font-bold tracking-tight">Dashboard View Interrupted</h2>
            <p className="text-xs text-[#9499B3] leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred in the studio view.'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold transition cursor-pointer"
            >
              Reload Studio
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
