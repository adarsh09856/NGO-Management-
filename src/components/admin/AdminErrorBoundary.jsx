import React from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export default class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Panel Runtime Error Caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/admin';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-xl w-full bg-[#0F172A] text-white rounded-2xl border-2 border-[#D4AF37]/50 shadow-2xl p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-[#1E293B] pb-4">
              <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow-md">
                <ShieldAlert className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif-brand text-white">
                  Admin Workspace Protected
                </h2>
                <p className="text-xs text-gray-400">
                  A component encountered an unexpected error, but your database and unsaved settings remain safe.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 font-mono space-y-1">
              <p className="font-bold text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{this.state.error?.name || 'Runtime Error'}:</span>
              </p>
              <p className="break-words leading-relaxed">
                {this.state.error?.message || 'An unexpected rendering error occurred in this admin panel view.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto flex-1 monastic-gold-btn py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer font-bold"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-gray-200 hover:text-white text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer font-semibold"
              >
                <Home className="w-4 h-4" />
                <span>Admin Overview</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
