
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { UserCheck, Mail } from 'lucide-react';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { useAuth } from '@/contexts/auth';
import { useIntelligentRedirect } from '@/hooks/useIntelligentRedirect';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import InviteRegisterForm from '@/components/auth/InviteRegisterForm';
import InviteErrorScreen from '@/components/auth/InviteErrorScreen';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const InviteAcceptPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { redirect } = useIntelligentRedirect();
  const inviteToken = searchParams.get('token');
  
  const {
    isLoading,
    inviteDetails,
    error,
    isProcessing,
    acceptInvite,
    registerWithInvite
  } = useInviteFlow(inviteToken || undefined);

  // Aceitar convite para usuário logado
  const handleAcceptForLoggedUser = async () => {
    const result = await acceptInvite();
    
    if (result.success) {
      toast.success(result.message);
      
      redirect({
        requiresOnboarding: result.requiresOnboarding,
        fromInvite: true,
        preserveToken: result.requiresOnboarding
      });
    } else {
      toast.error(result.message);
    }
  };

  // Registrar novo usuário
  const handleRegisterNewUser = async (name: string, password: string) => {
    if (inviteToken) {
      InviteTokenManager.storeToken(inviteToken);
    }

    const result = await registerWithInvite(name, password);
    
    if (result.success) {
      toast.success(result.message);
      
      redirect({
        requiresOnboarding: result.requiresOnboarding,
        fromInvite: true,
        preserveToken: false
      });
      
      return result;
    } else {
      InviteTokenManager.clearToken();
      toast.error(result.message);
      return result;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4" />
            <p className="text-neutral-300">Verificando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (!inviteToken || error || !inviteDetails) {
    return (
      <InviteErrorScreen
        error={!inviteToken ? 'Token de convite não encontrado' : (error || 'Convite inválido')}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Usuário já logado - verificação melhorada
  if (user) {
    const userEmail = user.email || '';
    const inviteEmail = inviteDetails.email;
    
    // Verificar se o email confere
    if (userEmail.toLowerCase() !== inviteEmail.toLowerCase()) {
      return (
        <InviteErrorScreen
          error={`Este convite foi enviado para ${inviteEmail}, mas você está logado como ${userEmail}. Faça login com a conta correta.`}
          showRequestNewInvite={false}
        />
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center">
              <UserCheck className="w-8 h-8 text-viverblue" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Aceitar Convite
              </h2>
              <p className="text-neutral-300">
                Você está logado como <strong className="text-white">{userEmail}</strong>
              </p>
            </div>

            <div className="bg-[#252842]/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-viverblue" />
                <span className="text-sm font-medium text-white">
                  Convite para:
                </span>
              </div>
              <p className="text-neutral-300">
                {inviteDetails.email}
              </p>
              
              <div className="mt-2">
                <span className="text-sm font-medium text-white">
                  Cargo: 
                </span>
                <span className="ml-2 text-sm px-3 py-1 bg-viverblue/20 text-viverblue rounded-full">
                  {inviteDetails.role.name === 'formacao' ? 'Formação' : 'Membro do Clube'}
                </span>
              </div>
            </div>

            <Button
              onClick={handleAcceptForLoggedUser}
              disabled={isProcessing}
              className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-medium py-3"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Aceitando convite...</span>
                </div>
              ) : (
                'Aceitar Convite'
              )}
            </Button>

            <div className="text-center">
              <button 
                onClick={() => redirect({ requiresOnboarding: false })}
                className="text-sm text-neutral-400 hover:text-white underline"
              >
                Trocar de conta
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usuário não logado - mostrar formulário de registro
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <InviteRegisterForm
            email={inviteDetails.email}
            roleName={inviteDetails.role.name}
            onSubmit={handleRegisterNewUser}
            isLoading={isProcessing}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteAcceptPage;
