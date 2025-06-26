
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class LoggingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('[DEBUG-ERROR-BOUNDARY] 💥 Erro capturado pelo Error Boundary:', error);
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DEBUG-ERROR-BOUNDARY] 📊 Detalhes do erro:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    logger.error('[ERROR-BOUNDARY] Erro capturado:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
          <div className="text-center text-white p-8 max-w-2xl">
            <div className="mb-6">
              <div className="text-red-400 text-6xl mb-4">💥</div>
              <h2 className="text-2xl font-bold mb-4">Erro Inesperado</h2>
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
                <p className="text-red-100 font-semibold mb-2">Erro:</p>
                <p className="text-red-200 text-sm break-words mb-4">
                  {this.state.error?.message}
                </p>
                
                {import.meta.env.DEV && this.state.error?.stack && (
                  <details className="text-xs text-red-300">
                    <summary className="cursor-pointer mb-2">Stack Trace (Dev)</summary>
                    <pre className="whitespace-pre-wrap break-all">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  console.log('[DEBUG-ERROR-BOUNDARY] 🔄 Recarregando página...');
                  window.location.reload();
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🔄 Recarregar Página
              </button>
              
              <button
                onClick={() => {
                  console.log('[DEBUG-ERROR-BOUNDARY] 🏠 Voltando ao início...');
                  window.location.href = '/';
                }}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🏠 Voltar ao Início
              </button>
            </div>
            
            <div className="mt-6 text-xs text-gray-400">
              Este erro foi registrado automaticamente. Se persistir, contate o suporte.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
