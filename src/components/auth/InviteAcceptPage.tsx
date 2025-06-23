
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import RegisterForm from './RegisterForm';

const InviteAcceptPage = () => {
  const { token: paramToken } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Token único de múltiplas fontes
  const inviteToken = paramToken || InviteTokenManager.getToken();
  
  const {
    isLoading,
    inviteDetails,
    error,
    isProcessing,
    acceptInvite,
    registerWithInvite
  } = useInviteFlow(inviteToken);

  console.log('[INVITE-ACCEPT-PAGE] Estado:', {
    hasToken: !!inviteToken,
    hasUser: !!user,
    hasInviteDetails: !!inviteDetails,
    isLoading,
    error,
    showRegisterForm
  });

  // Guardar token quando disponível
  useEffect(() => {
    if (inviteToken) {
      InviteTokenManager.storeToken(inviteToken);
    }
  }, [inviteToken]);

  // Loading inicial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-white/80">Carregando detalhes do convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Erro ao carregar convite
  if (error || !inviteDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-white">Convite Inválido</CardTitle>
            <CardDescription className="text-white/60">
              {error || 'Convite não encontrado ou expirado'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usuário logado - aceitar convite
  if (user && !showRegisterForm) {
    const userEmail = (user.email || '').toLowerCase();
    const inviteEmail = inviteDetails.email.toLowerCase();
    const emailMatches = userEmail === inviteEmail;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <CardHeader className="text-center">
            <UserPlus className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <CardTitle className="text-white">Aceitar Convite</CardTitle>
            <CardDescription className="text-white/60">
              Você foi convidado para {inviteDetails.role.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-[#2A2E3E]/50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-white/60">Convite para:</p>
              <p className="text-white font-medium">{inviteDetails.email}</p>
              <p className="text-sm text-white/60">Papel:</p>
              <p className="text-white font-medium">{inviteDetails.role.name}</p>
            </div>

            {!emailMatches && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Este convite foi enviado para {inviteDetails.email}, mas você está logado como {user.email}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={async () => {
                const result = await acceptInvite();
                if (result.success) {
                  if (result.requiresOnboarding) {
                    navigate('/onboarding', { replace: true });
                  } else {
                    navigate('/dashboard', { replace: true });
                  }
                }
              }}
              disabled={!emailMatches || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aceitando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aceitar Convite
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Cancelar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usuário não logado ou modo registro
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
        <CardHeader className="text-center">
          <UserPlus className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <CardTitle className="text-white">Criar Conta</CardTitle>
          <CardDescription className="text-white/60">
            Complete seu registro para aceitar o convite
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-[#2A2E3E]/50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-white/60">Convite para:</p>
            <p className="text-white font-medium">{inviteDetails.email}</p>
            <p className="text-sm text-white/60">Papel:</p>
            <p className="text-white font-medium">{inviteDetails.role.description}</p>
          </div>

          <RegisterForm
            defaultEmail={inviteDetails.email}
            inviteToken={inviteToken}
            onSuccess={() => {
              // Após registro bem-sucedido, redirecionar para onboarding
              navigate('/onboarding', { replace: true });
            }}
            onError={(error) => {
              console.error('[INVITE-ACCEPT-PAGE] Erro no registro:', error);
            }}
          />

          <div className="text-center">
            <p className="text-sm text-white/60">
              Já tem uma conta?{' '}
              <Button
                variant="link"
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 p-0"
              >
                Fazer login
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteAcceptPage;
