
import React, { Component, ReactNode, ErrorInfo } from 'react';
import { ErrorFallback } from './ErrorFallback';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface AsyncErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isAsyncError: boolean;
  retryCount: number;
}

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  onAsyncError?: (error: Error) => void;
  maxRetries?: number;
  autoRetry?: boolean;
  retryDelay?: number;
}

class AsyncErrorBoundary extends Component<AsyncErrorBoundaryProps, AsyncErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: AsyncErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isAsyncError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AsyncErrorBoundaryState> {
    // Detectar se é um erro assíncrono
    const isAsyncError = 
      error.message.includes('async') ||
      error.message.includes('promise') ||
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('abort') ||
      error.name === 'AbortError' ||
      error.name === 'TimeoutError' ||
      error.name === 'NetworkError';

    return {
      hasError: true,
      error,
      isAsyncError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onAsyncError, autoRetry, retryDelay = 2000, maxRetries = 3 } = this.props;
    const { isAsyncError, retryCount } = this.state;

    // Log específico para erros assíncronos
    logger.error('AsyncErrorBoundary capturou um erro', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      isAsyncError,
      retryCount,
      errorBoundary: 'AsyncErrorBoundary'
    });

    if (isAsyncError && onAsyncError) {
      onAsyncError(error);
    }

    // Toast específico para operações assíncronas
    if (isAsyncError) {
      toast.error('Erro em operação assíncrona', {
        description: 'Problema na comunicação com o servidor.'
      });
    }

    // Auto retry para erros assíncronos
    if (isAsyncError && autoRetry && retryCount < maxRetries) {
      toast.info(`Tentando novamente em ${retryDelay / 1000}s...`);
      
      this.retryTimeoutId = window.setTimeout(() => {
        this.handleRetry();
      }, retryDelay);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        isAsyncError: false,
        retryCount: retryCount + 1,
      });

      logger.info('AsyncErrorBoundary: Tentativa de recuperação automática', { 
        retryCount: retryCount + 1,
        maxRetries 
      });
    } else {
      toast.error('Máximo de tentativas excedido', {
        description: 'Verifique sua conexão e tente novamente.'
      });
    }
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    const { hasError, error, isAsyncError } = this.state;
    const { children, maxRetries = 3 } = this.props;

    if (hasError) {
      const title = isAsyncError 
        ? 'Erro de Comunicação' 
        : 'Erro Assíncrono';
      
      const description = isAsyncError
        ? 'Não foi possível completar a operação devido a um problema de rede ou servidor.'
        : 'Ocorreu um erro durante uma operação em segundo plano.';

      return (
        <ErrorFallback
          error={error}
          errorInfo={null}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          retryCount={this.state.retryCount}
          maxRetries={maxRetries}
          title={title}
          description={description}
          variant="detailed"
          showDetails={true}
        />
      );
    }

    return children;
  }
}

export default AsyncErrorBoundary;
