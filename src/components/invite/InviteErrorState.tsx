import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, AlertTriangle, RefreshCw, Home, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InviteErrorStateProps {
  error: string;
  suggestions?: string[];
  needsLogout?: boolean;
  onLogout?: () => void;
  onRetry?: () => void;
}

const InviteErrorState: React.FC<InviteErrorStateProps> = ({
  error,
  suggestions = [],
  needsLogout = false,
  onLogout,
  onRetry
}) => {
  const navigate = useNavigate();

  const getErrorType = () => {
    if (error.toLowerCase().includes('expirado') || error.toLowerCase().includes('expired')) {
      return 'expired';
    }
    if (error.toLowerCase().includes('usado') || error.toLowerCase().includes('used')) {
      return 'used';
    }
    if (error.toLowerCase().includes('inválido') || error.toLowerCase().includes('invalid')) {
      return 'invalid';
    }
    return 'general';
  };

  const errorType = getErrorType();

  const getErrorConfig = () => {
    switch (errorType) {
      case 'expired':
        return {
          icon: AlertTriangle,
          title: 'Convite Expirado',
          color: 'text-status-warning',
          bgColor: 'from-status-warning/10 to-status-warning/5',
          iconBg: 'bg-status-warning/10',
          iconColor: 'text-status-warning'
        };
      case 'used':
        return {
          icon: XCircle,
          title: 'Convite Já Utilizado',
          color: 'text-operational',
          bgColor: 'from-operational/10 to-operational/5',
          iconBg: 'bg-operational/10',
          iconColor: 'text-operational'
        };
      case 'invalid':
        return {
          icon: XCircle,
          title: 'Convite Inválido',
          color: 'text-status-error',
          bgColor: 'from-status-error/10 to-status-error/5',
          iconBg: 'bg-status-error/10',
          iconColor: 'text-status-error'
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Erro no Convite',
          color: 'text-status-warning',
          bgColor: 'from-status-warning/10 to-status-warning/5',
          iconBg: 'bg-status-warning/10',
          iconColor: 'text-status-warning'
        };
    }
  };

  const errorConfig = getErrorConfig();
  const IconComponent = errorConfig.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="text-center space-y-6">
            {/* Error Icon */}
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <IconComponent className="h-8 w-8 text-destructive" />
          </div>

            {/* Error Title */}
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-bold text-destructive">
                {errorConfig.title}
              </h2>
              <p className="text-muted-foreground">
                Não foi possível processar seu convite
              </p>
            </div>

            {/* Error Message */}
            <Alert variant="destructive" className="text-left">
              <AlertDescription className="text-sm">
                {error}
              </AlertDescription>
            </Alert>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <div className="flex items-start gap-2">
                  <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-2">O que você pode fazer:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {needsLogout && onLogout && (
                <Button 
                  onClick={onLogout} 
                  variant="outline" 
                  className="w-full h-12"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Fazer Logout e Tentar Novamente
                </Button>
              )}
              
              {onRetry && (
                <Button 
                  onClick={onRetry} 
                  variant="outline" 
                  className="w-full h-12"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
              )}

              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full h-12"
              >
                <Home className="mr-2 h-4 w-4" />
                Ir para Login
              </Button>
            </div>

            {/* Support */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">
                Precisa de ajuda?
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary/80"
              >
                <HelpCircle className="mr-2 h-3 w-3" />
                Falar com Suporte
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteErrorState;