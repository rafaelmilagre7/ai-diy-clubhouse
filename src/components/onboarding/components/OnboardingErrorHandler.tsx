
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Mail, 
  Clock, 
  XCircle,
  WifiOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingErrorHandlerProps {
  error: string;
  type?: 'network' | 'validation' | 'permission' | 'timeout' | 'system';
  onRetry?: () => void;
  onCancel?: () => void;
  showContactSupport?: boolean;
}

export const OnboardingErrorHandler: React.FC<OnboardingErrorHandlerProps> = ({
  error,
  type = 'system',
  onRetry,
  onCancel,
  showContactSupport = true
}) => {
  const navigate = useNavigate();

  const errorConfigs = {
    network: {
      icon: <WifiOff className="w-8 h-8 text-amber-400" />,
      title: 'Problema de Conexão',
      description: 'Verifique sua internet e tente novamente',
      color: 'amber',
      canRetry: true
    },
    validation: {
      icon: <AlertTriangle className="w-8 h-8 text-red-400" />,
      title: 'Dados Inválidos',
      description: 'Alguns dados precisam ser corrigidos',
      color: 'red',
      canRetry: false
    },
    permission: {
      icon: <XCircle className="w-8 h-8 text-red-400" />,
      title: 'Acesso Negado',
      description: 'Você não tem permissão para esta ação',
      color: 'red',
      canRetry: false
    },
    timeout: {
      icon: <Clock className="w-8 h-8 text-amber-400" />,
      title: 'Tempo Esgotado',
      description: 'A operação demorou mais que o esperado',
      color: 'amber',
      canRetry: true
    },
    system: {
      icon: <AlertTriangle className="w-8 h-8 text-red-400" />,
      title: 'Erro do Sistema',
      description: 'Ocorreu um problema interno',
      color: 'red',
      canRetry: true
    }
  };

  const config = errorConfigs[type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
        <CardContent className="p-6 text-center space-y-6">
          <div className={`mx-auto w-16 h-16 bg-${config.color}-500/20 rounded-full flex items-center justify-center`}>
            {config.icon}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              {config.title}
            </h2>
            <p className="text-neutral-300">
              {config.description}
            </p>
          </div>

          <Alert variant="destructive" className={`bg-${config.color}-500/10 border-${config.color}-500/20`}>
            <AlertTriangle className={`h-4 w-4 text-${config.color}-400`} />
            <AlertDescription className={`text-${config.color}-400`}>
              {error}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {config.canRetry && onRetry && (
              <Button 
                onClick={onRetry}
                className="w-full bg-viverblue hover:bg-viverblue/90 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            )}

            {showContactSupport && (
              <Button 
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full border-viverblue/50 text-viverblue hover:bg-viverblue/10"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contatar Suporte
              </Button>
            )}

            <Button 
              onClick={onCancel || (() => navigate('/login'))}
              variant="ghost"
              className="w-full text-neutral-400 hover:text-white"
            >
              Voltar ao Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
