import { AlertTriangle, RotateCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  /**
   * Optional custom fallback. Receives the caught error and a reset callback.
   */
  fallback?: (error: Error, reset: () => void) => ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

/**
 * Catches render / lifecycle errors from any descendant component and shows a
 * friendly fallback UI instead of crashing the whole application.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <YourApp />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep noise to a minimum but preserve stack for debugging.
    // In production this is where you'd wire up Sentry / Datadog.
    console.error('[ErrorBoundary] Uncaught render error:', error, info);
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (!error) return children;

    if (fallback) return fallback(error, this.handleReset);

    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-canvas px-6">
        <div className="surface-card flex max-w-md flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <AlertTriangle size={28} strokeWidth={2.2} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-[18px] font-bold text-slate-800">
              页面出错了
            </h2>
            <p className="text-[13px] leading-relaxed text-slate-500">
              当前页面发生了意外错误。你可以尝试重新加载页面，如果问题持续出现请联系系统管理员。
            </p>
          </div>

          {error.message ? (
            <div className="w-full max-h-24 overflow-auto rounded-lg border border-hairline bg-slate-50 p-2 text-left text-[11px] font-mono text-slate-500">
              {error.message}
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="focus-ring rounded-full border border-hairline bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-600"
            >
              重试
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="focus-ring press-lift inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(58,92,255,0.55)]"
            >
              <RotateCw size={14} strokeWidth={2.4} />
              重新加载页面
            </button>
          </div>
        </div>
      </div>
    );
  }
}
