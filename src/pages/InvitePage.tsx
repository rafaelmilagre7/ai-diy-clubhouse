
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useInviteValidation } from '@/hooks/admin/invites/useInviteValidation';
import { useOnboardingRedirect } from '@/hooks/useOnboardingRedirect';
import InviteLoadingState from '@/components/invite/InviteLoadingState';
import InviteErrorState from '@/components/invite/InviteErrorState';
import InviteSuccessState from '@/components/invite/InviteSuccessState';
import InviteWelcomeSection from '@/components/invite/InviteWelcomeSection';
import ModernRegisterForm from '@/components/invite/ModernRegisterForm';

const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { validationState, validateToken } = useInviteValidation();
  const { redirectToNextStep } = useOnboardingRedirect();
  
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  useEffect(() => {
    if (token) {
      handleValidateToken();
    }
  }, [token]);

  const handleValidateToken = async () => {
    if (!token) return;
    
    try {
      const result = await validateToken(token, user?.email);
      setValidationResult(result);
      
      // 🎯 NOVO FLUXO: Mostrar dados pré-carregados do perfil
      if (result.valid && !user) {
        setShowRegisterForm(true);
      }
    } catch (error) {
      console.error('Erro na validação:', error);
    }
  };

  const handleLogout = () => {
    // Implementar logout se necessário
    window.location.href = '/auth';
  };

  if (validationState.isValidating) {
    return <InviteLoadingState message="Validando seu convite..." />;
  }

  if (!validationResult) {
    return (
      <InviteErrorState 
        error="Token de convite não encontrado"
        suggestions={[
          "Verifique se o link está correto",
          "Solicite um novo convite",
          "Entre em contato com quem te convidou"
        ]}
      />
    );
  }

  if (!validationResult.valid) {
    return (
      <InviteErrorState 
        error={validationResult.message}
        suggestions={[
          "Verifique se o token está correto",
          "Solicite um novo convite",
          "Entre em contato com o administrador"
        ]}
        onRetry={() => handleValidateToken()}
      />
    );
  }

  if (user && user.email === validationResult.invite?.email) {
    // Usuário já está logado com o email correto do convite
    // Redirecionar direto para onboarding se não completou
    const isOnboardingCompleted = user.user_metadata?.onboarding_completed;
    
    if (!isOnboardingCompleted) {
      console.log('🎯 [INVITE] Usuário logado, redirecionando para onboarding');
      setTimeout(() => {
        redirectToNextStep();
      }, 1000);
      
      return (
        <InviteLoadingState message="Redirecionando para seu onboarding personalizado..." />
      );
    }
    
    // Se já completou onboarding, mostrar sucesso
    return (
      <InviteSuccessState 
        userName={user.user_metadata?.name || user.email?.split('@')[0]}
        userEmail={user.email}
      />
    );
  }

  if (showRegisterForm && validationResult.invite) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo do Club */}
          <div className="mb-8 text-center">
            <img
              src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
              alt="VIVER DE IA Club"
              className="mx-auto h-16 w-auto"
            />
          </div>

          {/* Título */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-white mb-2">
              Complete seu acesso
            </h1>
            <p className="text-gray-400">
              Finalize seu cadastro para acessar a plataforma
            </p>
          </div>

          {/* Formulário */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-6">
            <ModernRegisterForm 
              inviteToken={token}
              prefilledEmail={validationResult.invite.email}
              prefilledName={validationResult.invite.profile_data?.name}
              onSuccess={() => {
                console.log('🎯 [INVITE] Registro concluído via InvitePage');
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <InviteErrorState 
      error="Estado inesperado do convite"
      suggestions={[
        "Tente recarregar a página",
        "Verifique sua conexão com a internet",
        "Entre em contato com o suporte"
      ]}
      onRetry={() => window.location.reload()}
    />
  );
};

export default InvitePage;
