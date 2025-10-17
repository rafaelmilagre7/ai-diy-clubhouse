
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bug, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { useNavigate } from 'react-router-dom';

interface ErrorDebugInfoProps {
  error: Error | null;
  errorInfo?: React.ErrorInfo | null;
  context?: string;
  additionalData?: Record<string, any>;
  onRetry?: () => void;
}

export const ErrorDebugInfo: React.FC<ErrorDebugInfoProps> = ({
  error,
  errorInfo,
  context,
  additionalData,
  onRetry
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStack, setShowStack] = useState(false);
  const navigate = useNavigate();

  // Só mostrar em desenvolvimento
  if (!import.meta.env.DEV || !error) {
    return null;
  }

  const sanitizeErrorData = (data: any) => {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'email', 'phone', 'api_key'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Informações copiadas para a área de transferência');
      
      logger.info("Debug info copiado", {
        component: 'ERROR_DEBUG_INFO',
        context: context || 'unknown'
      });
    } catch (err) {
      toast.error('Erro ao copiar informações');
      logger.error("Erro ao copiar debug info", {
        error: err instanceof Error ? err.message : 'Erro desconhecido',
        component: 'ERROR_DEBUG_INFO'
      });
    }
  };

  const handleReload = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Fallback: voltar para dashboard em vez de reload
      navigate('/dashboard');
    }
  };

  const formatDebugInfo = () => {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      context: context || 'Unknown',
      error: {
        name: error.name,
        message: error.message,
        // Stack trace apenas em desenvolvimento
        stack: import.meta.env.DEV ? error.stack : '[HIDDEN_IN_PRODUCTION]'
      },
      errorInfo: errorInfo ? {
        componentStack: import.meta.env.DEV ? errorInfo.componentStack : '[HIDDEN_IN_PRODUCTION]'
      } : null,
      url: window.location.href,
      userAgent: navigator.userAgent.substring(0, 100), // Limitar tamanho
      additionalData: sanitizeErrorData(additionalData || {})
    };

    return JSON.stringify(debugInfo, null, 2);
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsExpanded(true)}
          className="bg-status-error/10 border-status-error/30 text-status-error hover:bg-status-error/20"
        >
          <Bug className="w-4 h-4 mr-1" />
          Debug Info
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-hidden">
      <Card className="border-status-error/30 bg-status-error/10">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-status-error flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Error Debug Info (DEV)
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 text-sm">
            <div>
              <strong className="text-status-error">Error:</strong>
              <p className="text-status-error/90 break-words">{error.message}</p>
            </div>

            {context && (
              <div>
                <strong className="text-status-error">Context:</strong>
                <p className="text-status-error/90">{context}</p>
              </div>
            )}

            <div>
              <strong className="text-status-error">Type:</strong>
              <p className="text-status-error/90">{error.name}</p>
            </div>

          {import.meta.env.DEV && error.stack && (
            <div>
              <div className="flex items-center justify-between">
                <strong className="text-status-error">Stack Trace:</strong>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowStack(!showStack)}
                  className="h-6 text-xs"
                >
                  {showStack ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>
              {showStack && (
                <pre className="text-xs text-status-error bg-status-error/20 p-2 rounded overflow-auto max-h-32">
                  {error.stack}
                </pre>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(formatDebugInfo())}
              className="flex-1 text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copiar Debug
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReload}
              className="flex-1 text-xs"
            >
              Tentar novamente
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                throw error || new Error('Erro forçado para debug');
              }}
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              Forçar erro (debug)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorDebugInfo;
