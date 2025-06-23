
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { useIntelligentRedirect } from '@/hooks/useIntelligentRedirect';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { InviteSecurityUtils } from '@/utils/inviteSecurityUtils';
import { OnboardingLoadingState } from '@/components/onboarding/components/OnboardingLoadingStates';
import { OnboardingErrorHandler } from '@/components/onboarding/components/OnboardingErrorHandler';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, User } from 'lucide-react';
import { toast } from 'sonner';

const InviteAcceptPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { redirect } = useIntelligentRedirect();
  
  const token = searchParams.get('token');
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptanceError, setAcceptanceError] = useState<string>('');
  
  const { 
    inviteDetails, 
    isLoading: inviteLoading, 
    error: inviteError, 
    acceptInvite,
    isProcessing 
  } = useInviteFlow(token || undefined);

  // Validação inicial do token
  useEffect(() => {
    if (!token) {
      console.log('[INVITE-ACCEPT] Token não fornecido');
      navigate('/login');
      return;
    }

    if (!InviteSecurityUtils.validateTokenFormat(token)) {
      console.log('[INVITE-ACCEPT] Formato de token inválido');
      toast.error('Formato de convite inválido');
      navigate('/login');
      return;
    }

    // Preservar token para uso posterior se necessário
    InviteTokenManager.storeToken(token);
    console.log('[INVITE-ACCEPT] Token preservado para fluxo');
  }, [token, navigate]);

  const handleAcceptInvite = async () => {
    if (!user || !inviteDetails) {
      toast.error('Dados insuficientes para aceitar convite');
      return;
    }

    try {
      setIsAccepting(true);
      setAcceptanceError('');

      console.log('[INVITE-ACCEPT] Iniciando aceitação do convite');

      // Validação backend antes de aceitar
      const validation = await InviteSecurityUtils.validateUserInviteMatch(token!, user.id);
      
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Aceitar convite
      const result = await acceptInvite();
      
      if (result.success) {
        toast.success(result.message);
        
        // Log de sucesso
        await InviteSecurityUtils.logInviteUsageAttempt(
          token!,
          true,
          'Convite aceito com sucesso',
          user.id
        );

        // Redirecionamento inteligente
        redirect({
          requiresOnboarding: result.requiresOnboarding,
          fromInvite: true,
          preserveToken: result.requiresOnboarding
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('[INVITE-ACCEPT] Erro ao aceitar convite:', error);
      setAcceptanceError(error.message);
      toast.error(error.message);
      
      // Log de erro
      await InviteSecurityUtils.logInviteUsageAttempt(
        token!,
        false,
        error.message,
        user?.id
      );
    } finally {
      setIsAccepting(false);
    }
  };

  const handleGoToRegister = () => {
    if (token) {
      navigate(`/register?token=${token}`);
    } else {
      navigate('/register');
    }
  };

  // Loading states
  if (authLoading) {
    return <OnboardingLoadingState type="verification" message="Verificando sua sessão..." />;
  }

  if (inviteLoading) {
    return <OnboardingLoadingState type="verification" message="Validando seu convite..." />;
  }

  // Error states
  if (inviteError) {
    return (
      <OnboardingErrorHandler
        error={inviteError}
        type="validation"
        onRetry={() => window.location.reload()}
        onCancel={() => navigate('/login')}
        showContactSupport={true}
      />
    );
  }

  if (acceptanceError) {
    return (
      <OnboardingErrorHandler
        error={acceptanceError}
        type="system"
        onRetry={() => setAcceptanceError('')}
        onCancel={() => navigate('/login')}
        showContactSupport={true}
      />
    );
  }

  // Se não está logado, mostrar opção de registro
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-viverblue" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Você foi convidado!
              </h2>
              {inviteDetails && (
                <p className="text-neutral-300">
                  Convite para: <span className="text-viverblue font-medium">{inviteDetails.email}</span>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleGoToRegister}
                className="w-full bg-viverblue hover:bg-viverblue/90 text-white"
                disabled={isProcessing}
              >
                <User className="h-4 w-4 mr-2" />
                Criar Conta e Aceitar Convite
              </Button>

              <Button 
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full border-viverblue/50 text-viverblue hover:bg-viverblue/10"
              >
                Já tenho conta - Fazer Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se está logado e tem convite válido, mostrar opção de aceitar
  if (inviteDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Aceitar Convite
              </h2>
              <p className="text-neutral-300">
                Você foi convidado para se juntar como:
              </p>
              <p className="text-viverblue font-semibold text-lg">
                {inviteDetails.role.description}
              </p>
            </div>

            <div className="bg-[#252842]/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-neutral-400">
                <strong>Email do convite:</strong> {inviteDetails.email}
              </p>
              <p className="text-sm text-neutral-400">
                <strong>Seu email:</strong> {user.email}
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleAcceptInvite}
                className="w-full bg-viverblue hover:bg-viverblue/90 text-white"
                disabled={isAccepting || isProcessing}
              >
                {isAccepting ? 'Aceitando...' : 'Aceitar Convite'}
              </Button>

              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full border-neutral-600 text-neutral-300 hover:bg-neutral-800"
              >
                Continuar sem Aceitar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback para estado inesperado
  return (
    <OnboardingErrorHandler
      error="Estado inesperado do convite"
      type="system"
      onRetry={() => window.location.reload()}
      onCancel={() => navigate('/login')}
    />
  );
};

export default InviteAcceptPage;
