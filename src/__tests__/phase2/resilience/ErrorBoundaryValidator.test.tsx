
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '../../utils/mockProviders';

// Error Boundary component for testing
class TestErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || (() => <div>Something went wrong!</div>);
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Components that throw different types of errors
const AsyncErrorComponent = () => {
  React.useEffect(() => {
    throw new Error('Async error in useEffect');
  }, []);
  
  return <div>Async Component</div>;
};

const RenderErrorComponent = () => {
  throw new Error('Render error');
};

const NetworkErrorComponent = () => {
  React.useEffect(() => {
    // Simulate network error
    fetch('/nonexistent-endpoint')
      .catch(() => {
        throw new Error('Network error');
      });
  }, []);
  
  return <div>Network Component</div>;
};

const StateErrorComponent = () => {
  const [state, setState] = React.useState(null);
  
  React.useEffect(() => {
    // This will cause an error when trying to access properties
    setState(null);
  }, []);
  
  // This will throw if state is null
  return <div>{(state as any).nonexistentProperty}</div>;
};

const SupabaseErrorComponent = () => {
  React.useEffect(() => {
    // Simulate Supabase RLS error
    throw new Error('Row level security policy violated');
  }, []);
  
  return <div>Supabase Component</div>;
};

// Custom fallback components
const CustomErrorFallback = ({ error }: { error?: Error }) => (
  <div>
    <h2>Oops! Algo deu errado</h2>
    <p>Erro: {error?.message}</p>
    <button onClick={() => window.location.reload()}>Tentar novamente</button>
  </div>
);

const NetworkErrorFallback = ({ error }: { error?: Error }) => (
  <div>
    <h2>Problemas de conectividade</h2>
    <p>Verifique sua conexão com a internet</p>
    <p>Detalhes: {error?.message}</p>
  </div>
);

describe('Error Boundary Validator - Fase 2', () => {
  // Suppress console errors during tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Error Catching', () => {
    test('Should catch render errors and display fallback', () => {
      render(
        <TestWrapper>
          <TestErrorBoundary>
            <RenderErrorComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    });

    test('Should display custom error fallback', () => {
      render(
        <TestWrapper>
          <TestErrorBoundary fallback={CustomErrorFallback}>
            <RenderErrorComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument();
      expect(screen.getByText('Erro: Render error')).toBeInTheDocument();
      expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
    });

    test('Should handle async errors gracefully', () => {
      render(
        <TestWrapper>
          <TestErrorBoundary>
            <AsyncErrorComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      // Should render normally (error boundaries don't catch async errors)
      expect(screen.getByText('Async Component')).toBeInTheDocument();
    });
  });

  describe('Authentication Related Errors', () => {
    test('Should handle authentication failures', () => {
      const AuthErrorComponent = () => {
        throw new Error('Authentication failed');
      };

      render(
        <TestWrapper authenticated={false}>
          <TestErrorBoundary fallback={CustomErrorFallback}>
            <AuthErrorComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Erro: Authentication failed')).toBeInTheDocument();
    });

    test('Should handle unauthorized access attempts', () => {
      const UnauthorizedComponent = () => {
        throw new Error('Insufficient permissions');
      };

      render(
        <TestWrapper authenticated={true} isAdmin={false}>
          <TestErrorBoundary fallback={CustomErrorFallback}>
            <UnauthorizedComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Erro: Insufficient permissions')).toBeInTheDocument();
    });
  });

  describe('Supabase Related Errors', () => {
    test('Should handle RLS policy violations', () => {
      render(
        <TestWrapper authenticated={true}>
          <TestErrorBoundary fallback={CustomErrorFallback}>
            <SupabaseErrorComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Erro: Row level security policy violated')).toBeInTheDocument();
    });

    test('Should handle database connection errors', () => {
      const DatabaseErrorComponent = () => {
        throw new Error('Database connection failed');
      };

      render(
        <TestWrapper>
          <TestErrorBoundary fallback={CustomErrorFallback}>
            <DatabaseErrorComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Erro: Database connection failed')).toBeInTheDocument();
    });

    test('Should handle storage upload failures', () => {
      const StorageErrorComponent = () => {
        throw new Error('File upload failed');
      };

      render(
        <TestWrapper>
          <TestErrorBoundary fallback={CustomErrorFallback}>
            <StorageErrorComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Erro: File upload failed')).toBeInTheDocument();
    });
  });

  describe('Network Related Errors', () => {
    test('Should handle network connectivity issues', () => {
      render(
        <TestWrapper>
          <TestErrorBoundary fallback={NetworkErrorFallback}>
            <NetworkErrorComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      // Network component should render (network errors are async)
      expect(screen.getByText('Network Component')).toBeInTheDocument();
    });

    test('Should handle API timeout errors', () => {
      const TimeoutErrorComponent = () => {
        throw new Error('Request timeout');
      };

      render(
        <TestWrapper>
          <TestErrorBoundary fallback={NetworkErrorFallback}>
            <TimeoutErrorComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Problemas de conectividade')).toBeInTheDocument();
      expect(screen.getByText('Detalhes: Request timeout')).toBeInTheDocument();
    });
  });

  describe('State Management Errors', () => {
    test('Should handle state corruption gracefully', () => {
      render(
        <TestWrapper>
          <TestErrorBoundary fallback={CustomErrorFallback}>
            <StateErrorComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument();
    });

    test('Should handle invalid prop types', () => {
      const InvalidPropsComponent = ({ invalidProp }: { invalidProp: string }) => {
        return <div>{invalidProp.toUpperCase()}</div>;
      };

      render(
        <TestWrapper>
          <TestErrorBoundary fallback={CustomErrorFallback}>
            <InvalidPropsComponent invalidProp={null as any} />
          </TestErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument();
    });
  });

  describe('Nested Error Boundaries', () => {
    test('Should handle nested error boundaries correctly', () => {
      const NestedErrorComponent = () => {
        throw new Error('Nested error');
      };

      render(
        <TestWrapper>
          <TestErrorBoundary fallback={() => <div>Outer boundary</div>}>
            <div>
              <TestErrorBoundary fallback={() => <div>Inner boundary</div>}>
                <NestedErrorComponent />
              </TestErrorBoundary>
            </div>
          </TestErrorBoundary>
        </TestWrapper>
      );

      // Inner boundary should catch the error
      expect(screen.getByText('Inner boundary')).toBeInTheDocument();
      expect(screen.queryByText('Outer boundary')).not.toBeInTheDocument();
    });

    test('Should propagate unhandled errors to parent boundary', () => {
      const ErrorComponent = () => {
        throw new Error('Propagated error');
      };

      const InnerBoundary = ({ children }: { children: React.ReactNode }) => {
        return <div>{children}</div>; // No error boundary
      };

      render(
        <TestWrapper>
          <TestErrorBoundary fallback={() => <div>Parent boundary</div>}>
            <InnerBoundary>
              <ErrorComponent />
            </InnerBoundary>
          </TestErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Parent boundary')).toBeInTheDocument();
    });
  });

  describe('Recovery Mechanisms', () => {
    test('Should provide recovery options in fallback UI', () => {
      render(
        <TestWrapper>
          <TestErrorBoundary fallback={CustomErrorFallback}>
            <RenderErrorComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      const retryButton = screen.getByText('Tentar novamente');
      expect(retryButton).toBeInTheDocument();
      expect(retryButton.tagName).toBe('BUTTON');
    });

    test('Should handle progressive degradation', () => {
      const DegradedFallback = () => (
        <div>
          <p>Modo simplificado ativo</p>
          <p>Algumas funcionalidades podem estar limitadas</p>
        </div>
      );

      render(
        <TestWrapper>
          <TestErrorBoundary fallback={DegradedFallback}>
            <RenderErrorComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Modo simplificado ativo')).toBeInTheDocument();
      expect(screen.getByText('Algumas funcionalidades podem estar limitadas')).toBeInTheDocument();
    });
  });

  describe('Error Logging and Reporting', () => {
    test('Should log errors for monitoring', () => {
      const consoleSpy = jest.spyOn(console, 'error');

      render(
        <TestWrapper>
          <TestErrorBoundary>
            <RenderErrorComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error caught by boundary:',
        expect.any(Error),
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    test('Should provide error details for debugging', () => {
      const ErrorDetailsComponent = ({ error }: { error?: Error }) => (
        <div>
          <h3>Error Details</h3>
          <p>Message: {error?.message}</p>
          <p>Stack: {error?.stack?.substring(0, 100)}...</p>
        </div>
      );

      render(
        <TestWrapper>
          <TestErrorBoundary fallback={ErrorDetailsComponent}>
            <RenderErrorComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Error Details')).toBeInTheDocument();
      expect(screen.getByText('Message: Render error')).toBeInTheDocument();
      expect(screen.getByText(/Stack:/)).toBeInTheDocument();
    });
  });

  describe('Performance Impact', () => {
    test('Should not significantly impact render performance', () => {
      const startTime = performance.now();

      const NormalComponent = () => <div>Normal component</div>;

      render(
        <TestWrapper>
          <TestErrorBoundary>
            <NormalComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Error boundary should not add significant overhead
      expect(renderTime).toBeLessThan(50);
      expect(screen.getByText('Normal component')).toBeInTheDocument();
    });

    test('Should handle multiple error boundaries efficiently', () => {
      const startTime = performance.now();

      render(
        <TestWrapper>
          {Array.from({ length: 10 }, (_, i) => (
            <TestErrorBoundary key={i}>
              <div>Component {i}</div>
            </TestErrorBoundary>
          ))}
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Multiple boundaries should still be efficient
      expect(renderTime).toBeLessThan(100);
    });
  });
});
