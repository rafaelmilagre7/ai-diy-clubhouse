
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bug, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ErrorDebugInfoProps {
  error: Error | null;
  errorInfo?: React.ErrorInfo | null;
  context?: string;
  additionalData?: Record<string, any>;
}

export const ErrorDebugInfo: React.FC<ErrorDebugInfoProps> = ({
  error,
  errorInfo,
  context,
  additionalData
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStack, setShowStack] = useState(false);

  // Só mostrar em desenvolvimento
  if (!import.meta.env.DEV || !error) {
    return null;
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Informações copiadas para a área de transferência');
    } catch (err) {
      toast.error('Erro ao copiar informações');
    }
  };

  const formatDebugInfo = () => {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      context: context || 'Unknown',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: errorInfo ? {
        componentStack: errorInfo.componentStack
      } : null,
      url: window.location.href,
      userAgent: navigator.userAgent,
      additionalData: additionalData || {}
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
          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
        >
          <Bug className="w-4 h-4 mr-1" />
          Debug Info
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-hidden">
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-red-800 flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Error Debug Info
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
            <strong className="text-red-800">Error:</strong>
            <p className="text-red-700 break-words">{error.message}</p>
          </div>

          {context && (
            <div>
              <strong className="text-red-800">Context:</strong>
              <p className="text-red-700">{context}</p>
            </div>
          )}

          <div>
            <strong className="text-red-800">Type:</strong>
            <p className="text-red-700">{error.name}</p>
          </div>

          <div>
            <strong className="text-red-800">URL:</strong>
            <p className="text-red-700 text-xs break-all">{window.location.href}</p>
          </div>

          {error.stack && (
            <div>
              <div className="flex items-center justify-between">
                <strong className="text-red-800">Stack Trace:</strong>
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
                <pre className="text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto max-h-32">
                  {error.stack}
                </pre>
              )}
            </div>
          )}

          {errorInfo && (
            <div>
              <strong className="text-red-800">Component Stack:</strong>
              <pre className="text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto max-h-20">
                {errorInfo.componentStack}
              </pre>
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
              onClick={() => window.location.reload()}
              className="flex-1 text-xs"
            >
              Reload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorDebugInfo;
