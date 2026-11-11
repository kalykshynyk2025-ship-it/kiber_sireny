import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0516] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#140a28] border-2 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)] text-center">
            <h2 className="font-russo text-xl text-rose-400 mb-2">СБОЙ СИСТЕМЫ ПУЛЬТА</h2>
            <p className="text-xs font-cyber text-slate-300 mb-4">
              {this.state.error?.message || 'Произошла непредвиденная ошибка в интерфейсе.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-[#ccff00] text-black font-russo text-xs uppercase cursor-pointer hover:bg-lime-400 transition-colors"
            >
              Перезагрузить пульт
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
