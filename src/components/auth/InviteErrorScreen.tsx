
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface InviteErrorScreenProps {
  error: string;
  onRetry?: () => void;
  showRequestNewInvite?: boolean;
}

const InviteErrorScreen = ({ 
  error, 
  onRetry, 
  showRequestNewInvite = true 
}: InviteErrorScreenProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
        <CardContent className="p-6 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Erro no Convite
            </h2>
            <p className="text-neutral-300 text-sm leading-relaxed">
              {error}
            </p>
          </div>

          <div className="space-y-3">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            )}

            {showRequestNewInvite && (
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-viverblue hover:bg-viverblue/90 text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                Solicitar Novo Convite
              </Button>
            )}

            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full text-neutral-400 hover:text-white"
            >
              Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteErrorScreen;
