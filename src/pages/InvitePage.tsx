
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useInviteValidation } from '@/hooks/admin/invites/useInviteValidation';
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
      
      if (result.isValid && !user) {
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

  if (!validationResult.isValid) {
    return (
      <InviteErrorState 
        error={validationResult.error}
        suggestions={validationResult.suggestions}
        needsLogout={validationResult.needsLogout}
        onLogout={handleLogout}
        onRetry={() => handleValidateToken()}
      />
    );
  }

  if (user && user.email === validationResult.invite?.email) {
    return (
      <InviteSuccessState 
        userName={user.user_metadata?.name || user.email?.split('@')[0]}
        userEmail={user.email}
      />
    );
  }

  if (showRegisterForm && validationResult.invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-viverblue/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Welcome Section */}
              <div className="order-2 lg:order-1">
                <InviteWelcomeSection inviteData={validationResult.invite} />
              </div>
              
              {/* Register Form */}
              <div className="order-1 lg:order-2">
                <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl">
                  <ModernRegisterForm 
                    inviteToken={token}
                    prefilledEmail={validationResult.invite.email}
                    onSuccess={() => {
                      setTimeout(() => {
                        navigate('/onboarding');
                      }, 2000);
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
