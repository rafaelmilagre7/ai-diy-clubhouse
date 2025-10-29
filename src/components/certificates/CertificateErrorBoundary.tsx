import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useToastModern } from '@/hooks/useToastModern';

interface CertificateErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const CertificateErrorFallback = ({ error, resetErrorBoundary }: CertificateErrorFallbackProps) => {
  const { showInfo } = useToastModern();
  
  const handleRetry = () => {
    resetErrorBoundary();
    showInfo('Recarregando...', 'Recarregando certificado...');
  };

  return (
    <div className="p-6 space-y-4">
      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Erro ao carregar certificado</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>Ocorreu um erro inesperado ao processar seu certificado.</p>
          <details className="text-xs bg-background/50 p-2 rounded border mt-2">
            <summary className="cursor-pointer font-medium">Detalhes técnicos</summary>
            <pre className="mt-2 text-xs overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        </AlertDescription>
      </Alert>
      
      <div className="flex gap-3">
        <Button 
          onClick={handleRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar Novamente
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          Recarregar Página
        </Button>
      </div>
    </div>
  );
};

interface CertificateErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<CertificateErrorFallbackProps>;
}

export const CertificateErrorBoundary = ({ 
  children, 
  fallback = CertificateErrorFallback 
}: CertificateErrorBoundaryProps) => {
  const { showError } = useToastModern();
  
  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    console.error('💥 Certificate Error Boundary caught error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Log para analytics se necessário
    showError('Erro no sistema', 'Erro no sistema de certificados');
  };

  return (
    <ErrorBoundary
      FallbackComponent={fallback}
      onError={handleError}
      onReset={() => {
        // Limpar cache relacionado a certificados
      }}
    >
      {children}
    </ErrorBoundary>
  );
};