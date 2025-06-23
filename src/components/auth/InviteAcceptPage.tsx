
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { useAuth } from '@/contexts/auth';
import { useIntelligentRedirect } from '@/hooks/useIntelligentRedirect';
import InviteRegisterForm from './InviteRegisterForm';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { AlertCircle, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InviteAcceptPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { redirect } = useIntelligentRedirect();
  
  // Token único - sem múltiplas fontes
  const inviteToken = searchParams.get('token') || InviteTokenManager.getToken();
  
  const {
    isLoading,
    inviteDetails,
    error,
    isProcessing,
    acceptInvite,
    registerWithInvite
  } = useInviteFlow(inviteToken || undefined);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-viverblue animate-spin mx-auto" />
          <h2 className="text-xl font-semibold text-white">Validando convite...</h2>
          <p className="text-neutral-400">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !inviteDetails) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Convite Inválido</h2>
            <p className="text-neutral-300">
              {error || 'Este convite não foi encontrado ou expirou.'}
            </p>
          </div>

          <div className="bg-[#1A1E2E] rounded-xl border border-neutral-700 p-4">
            <p className="text-sm text-neutral-400">
              Se você acredita que isso é um erro, entre em contato com quem enviou o convite.
            </p>
          </div>

          <Button
            onClick={() => window.location.href = '/login'}
            variant="outline"
            className="w-full"
          >
            Ir para Login
          </Button>
        </div>
      </div>
    );
  }

  // User logged in - accept invite
  if (user) {
    const handleAcceptInvite = async () => {
      try {
        const result = await acceptInvite();
        
        if (result.success) {
          redirect({
            requiresOnboarding: result.requiresOnboarding,
            fromInvite: true
          });
        }
      } catch (error) {
        console.error('Erro ao aceitar convite:', error);
      }
    };

    const userEmail = (user.email || '').toLowerCase();
    const inviteEmail = inviteDetails.email.toLowerCase();
    
    if (userEmail !== inviteEmail) {
      return (
        <div className="min-h-screen bg-[#0F1419] flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-400" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Email Diferente</h2>
              <p className="text-neutral-300">
                Este convite foi enviado para <strong className="text-white">{inviteDetails.email}</strong>, 
                mas você está logado como <strong className="text-white">{user.email}</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/logout'}
                className="w-full bg-viverblue hover:bg-viverblue/90"
              >
                Fazer Logout e Usar Convite
              </Button>
              
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
                className="w-full"
              >
                Ir para Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-viverblue" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Convite Válido!</h2>
            <p className="text-neutral-300">
              Pronto para aceitar seu convite como <strong className="text-viverblue">{inviteDetails.role.name}</strong>
            </p>
          </div>

          <div className="bg-[#1A1E2E] rounded-xl border border-neutral-700 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Email:</span>
              <span className="text-white">{inviteDetails.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Cargo:</span>
              <span className="text-viverblue">{inviteDetails.role.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Expira em:</span>
              <span className="text-white flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(inviteDetails.expires_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          <Button
            onClick={handleAcceptInvite}
            disabled={isProcessing}
            className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-semibold py-4 h-auto text-base"
          >
            {isProcessing ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Aceitando convite...</span>
              </div>
            ) : (
              'Aceitar Convite'
            )}
          </Button>
        </div>
      </div>
    );
  }

  // New user registration
  const handleRegisterWithInvite = async (name: string, password: string) => {
    const result = await registerWithInvite(name, password);
    
    if (result.success) {
      redirect({
        requiresOnboarding: result.requiresOnboarding,
        fromInvite: true
      });
    } else {
      throw new Error(result.message);
    }
  };

  return (
    <InviteRegisterForm
      email={inviteDetails.email}
      roleName={inviteDetails.role.name}
      onSubmit={handleRegisterWithInvite}
      isLoading={isProcessing}
    />
  );
};

export default InviteAcceptPage;
