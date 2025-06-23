
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InviteErrorScreenProps {
  error: string;
  onRetry?: () => void;
  showRequestNewInvite?: boolean;
}

const InviteErrorScreen: React.FC<InviteErrorScreenProps> = ({
  error,
  onRetry,
  showRequestNewInvite = true
}) => {
  const navigate = useNavigate();

  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes('expirado')) return 'expired';
    if (errorMessage.includes('já utilizado')) return 'used';
    if (errorMessage.includes('não encontrado')) return 'notFound';
    if (errorMessage.includes('email')) return 'emailMismatch';
    return 'generic';
  };

  const getErrorConfig = (type: string) => {
    switch (type) {
      case 'expired':
        return {
          title: 'Convite Expirado',
          description: 'Este convite perdeu a validade. Solicite um novo convite para acessar a plataforma.',
          icon: '⏰',
          showRequestNew: true
        };
      case 'used':
        return {
          title: 'Convite Já Utilizado',
          description: 'Este convite já foi aceito. Se você já tem uma conta, faça login normalmente.',
          icon: '✅',
          showRequestNew: false
        };
      case 'notFound':
        return {
          title: 'Convite Inválido',
          description: 'Este link de convite não é válido ou foi removido.',
          icon: '❌',
          showRequestNew: true
        };
      case 'emailMismatch':
        return {
          title: 'Email Incorreto',
          description: 'Este convite foi enviado para outro email. Use a conta correta ou solicite um novo convite.',
          icon: '📧',
          showRequestNew: true
        };
      default:
        return {
          title: 'Erro no Convite',
          description: 'Houve um problema ao processar seu convite.',
          icon: '⚠️',
          showRequestNew: true
        };
    }
  };

  const errorType = getErrorType(error);
  const config = getErrorConfig(errorType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
        <CardContent className="p-6 text-center space-y-6">
          <div className="text-6xl mb-4">
            {config.icon}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {config.title}
            </h2>
            <p className="text-neutral-300">
              {config.description}
            </p>
          </div>

          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {onRetry && (
              <Button 
                onClick={onRetry}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            )}

            {config.showRequestNew && showRequestNewInvite && (
              <Button 
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full border-viverblue/50 text-viverblue hover:bg-viverblue/10"
              >
                <Mail className="h-4 w-4 mr-2" />
                Solicitar Novo Convite
              </Button>
            )}

            <Button 
              onClick={() => navigate('/login')}
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

export default InviteErrorScreen;
