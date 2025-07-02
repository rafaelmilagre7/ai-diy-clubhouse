import React, { Component, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';
import { logger } from '@/utils/logger';

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  onRetry: () => void;
  onGoHome: () => void;
  retryCount: number;
  maxRetries: number;
  showDetails?: boolean;
}

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  showDetails?: boolean;
  resetOnLocationChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log do erro sempre, mesmo em produção (para erros críticos)
    logger.error('React Error Boundary caught an error', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // Callback customizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Em produção, logar erro crítico para monitoramento
    if (process.env.NODE_ENV === 'production') {
      console.log('[CRITICAL] React Error Boundary:', {
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary quando a localização muda (se habilitado)
    if (this.props.resetOnLocationChange && this.state.hasError) {
      if (window.location.pathname !== (prevProps as any).location?.pathname) {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: 0
        });
      }
    }
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      logger.error('Max retry attempts reached', {
        retryCount: this.state.retryCount,
        maxRetries
      });
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    // Auto-retry com delay
    this.retryTimeoutId = window.setTimeout(() => {
      if (this.state.hasError) {
        logger.info('Auto-retry failed, component still in error state');
      }
    }, 1000);
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      const { maxRetries = 3, showDetails = process.env.NODE_ENV === 'development' } = this.props;

      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          retryCount={this.state.retryCount}
          maxRetries={maxRetries}
          showDetails={showDetails}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;