
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useInviteValidation } from '@/hooks/admin/invites/useInviteValidation';

import InviteLoadingState from '@/components/invite/InviteLoadingState';
import InviteErrorState from '@/components/invite/InviteErrorState';
import InviteSuccessState from '@/components/invite/InviteSuccessState';
import InviteWelcomeSection from '@/components/invite/InviteWelcomeSection';
import ModernRegisterForm from '@/components/invite/ModernRegisterForm';

// Função para verificar se é um token do Supabase Auth (JWT)
const isSupabaseAuthToken = (token: string): boolean => {
  // Tokens JWT têm formato: header.payload.signature (contêm pontos)
  // Tokens de convite são alfanuméricos simples (30-32 chars)
  if (!token) return false;
  
  // Se contém pontos, provavelmente é JWT
  if (token.includes('.')) {
    console.log('🔍 [INVITE] Token contém pontos - provável JWT');
    return true;
  }
  
  // Se é muito longo (JWT são bem longos), também é provável que seja JWT
  if (token.length > 50) {
    console.log('🔍 [INVITE] Token muito longo - provável JWT');
    return true;
  }
  
  // Tokens de convite são alfanuméricos simples
  const inviteTokenPattern = /^[A-Za-z0-9]{20,40}$/;
  if (!inviteTokenPattern.test(token)) {
    console.log('🔍 [INVITE] Token não match padrão de convite - provável JWT');
    return true;
  }
  
  console.log('🔍 [INVITE] Token parece ser de convite válido');
  return false;
};

const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { validationState, validateToken } = useInviteValidation();
  
  
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  useEffect(() => {
    if (token) {
      // Verificar se é um token de auth do Supabase (JWT) ou token de convite
      if (isSupabaseAuthToken(token)) {
        console.log('🔄 [INVITE] Token de auth detectado, redirecionando para reset de senha');
        navigate(`/set-new-password#access_token=${token}&type=recovery`, { replace: true });
        return;
      }
      
      console.log('📨 [INVITE] Token de convite detectado, validando...');
      handleValidateToken();
    }
  }, [token, navigate]);

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
    // Redirecionar para dashboard
    return (
      <InviteSuccessState 
        userName={validationResult.invite?.email?.split('@')[0] || user.user_metadata?.name || user.email?.split('@')[0]}
        userEmail={user.email}
      />
    );
  }

  if (showRegisterForm && validationResult.invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-6 items-center">
              {/* Welcome Section */}
              <div className="order-2 lg:order-1">
                <InviteWelcomeSection inviteData={validationResult.invite} />
              </div>
              
              {/* Register Form */}
              <div className="order-1 lg:order-2 flex items-center justify-center">
                <div className="w-full max-w-sm bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                  <ModernRegisterForm 
                    inviteToken={token}
                    prefilledEmail={validationResult.invite.email}
                    prefilledName={validationResult.invite.profile_data?.name}
                    onSuccess={() => {
                      console.log('🎯 [INVITE] Registro concluído via InvitePage - redirecionando para onboarding');
                      // Redirecionar automaticamente para o onboarding
                      setTimeout(() => {
                        navigate('/onboarding');
                      }, 1500); // Aguardar 1.5s para mostrar mensagem de sucesso
                    }}
                  />
                </div>
              </div>
            </div>
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
