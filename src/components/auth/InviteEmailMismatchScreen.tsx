
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, AlertTriangle, LogOut, ArrowLeft } from 'lucide-react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { logger } from '@/utils/logger';

interface InviteEmailMismatchScreenProps {
  inviteEmail: string;
  currentEmail: string;
  token: string;
}

const InviteEmailMismatchScreen = ({
  inviteEmail,
  currentEmail,
  token
}: InviteEmailMismatchScreenProps) => {
  const navigate = useNavigate();
  const { signOut } = useSimpleAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutAndAcceptInvite = async () => {
    try {
      setIsLoggingOut(true);
      
      logger.info('[INVITE-MISMATCH] 🚪 Fazendo logout para aceitar convite:', {
        currentEmail,
        inviteEmail,
        token: token.substring(0, 8) + '***'
      });

      // Armazenar token antes do logout
      InviteTokenManager.storeToken(token);
      
      // Fazer logout
      await signOut();
      
      // Redirecionar para login com parâmetro de convite
      navigate(`/login?invite=true&token=${token}`, { replace: true });
      
    } catch (error) {
      logger.error('[INVITE-MISMATCH] ❌ Erro no logout:', error);
      setIsLoggingOut(false);
    }
  };

  const handleCancel = () => {
    logger.info('[INVITE-MISMATCH] ❌ Usuário cancelou aceitação do convite');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl">E-mail Incorreto</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Este convite foi enviado especificamente para{' '}
              <strong className="text-viverblue">{inviteEmail}</strong>, 
              mas você está logado como{' '}
              <strong className="text-amber-600">{currentEmail}</strong>.
            </AlertDescription>
          </Alert>

          <div className="text-center text-sm text-neutral-400">
            Para aceitar este convite, você precisa fazer login com o e-mail correto.
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleLogoutAndAcceptInvite}
              disabled={isLoggingOut}
              className="w-full bg-viverblue hover:bg-viverblue/80"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? 'Fazendo logout...' : 'Logout e aceitar convite'}
            </Button>

            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full"
              disabled={isLoggingOut}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar e voltar
            </Button>
          </div>

          <div className="text-xs text-center text-neutral-500">
            Se você não tem acesso ao e-mail {inviteEmail}, entre em contato com quem enviou o convite.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteEmailMismatchScreen;
