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
          color: 'text-orange-600',
          bgColor: 'from-orange-50 to-orange-100',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600'
        };
      case 'used':
        return {
          icon: XCircle,
          title: 'Convite Já Utilizado',
          color: 'text-blue-600',
          bgColor: 'from-blue-50 to-blue-100',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
      case 'invalid':
        return {
          icon: XCircle,
          title: 'Convite Inválido',
          color: 'text-red-600',
          bgColor: 'from-red-50 to-red-100',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600'
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Erro no Convite',
          color: 'text-yellow-600',
          bgColor: 'from-yellow-50 to-yellow-100',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        };
    }
  };

  const errorConfig = getErrorConfig();
  const IconComponent = errorConfig.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${errorConfig.bgColor} flex items-center justify-center p-4`}>
      <div className="w-full max-w-lg">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-xl">
          <div className="text-center space-y-6">
            {/* Error Icon */}
            <div className={`w-16 h-16 ${errorConfig.iconBg} rounded-full flex items-center justify-center mx-auto`}>
              <IconComponent className={`h-8 w-8 ${errorConfig.iconColor}`} />
            </div>

            {/* Error Title */}
            <div className="space-y-2">
              <h2 className={`font-heading text-2xl font-bold ${errorConfig.color}`}>
                {errorConfig.title}
              </h2>
              <p className="text-gray-600">
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
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="flex items-start gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">O que você pode fazer:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
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
                  className="w-full h-12 border-orange-200 text-orange-700 hover:bg-orange-50"
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
                className="w-full h-12 bg-viverblue hover:bg-viverblue-dark"
              >
                <Home className="mr-2 h-4 w-4" />
                Ir para Login
              </Button>
            </div>

            {/* Support */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">
                Precisa de ajuda?
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-viverblue hover:text-viverblue-dark hover:bg-viverblue/5"
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