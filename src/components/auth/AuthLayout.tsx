
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { showErrorToast } from '@/lib/toast-helpers';
import { useNavigate } from 'react-router-dom';
import { getUserRoleName } from '@/lib/supabase/types';
import { Loader2 } from 'lucide-react';
import { SignInPage } from '@/components/auth/SignInPage';
import { loginTestimonials } from '@/data/testimonials';

// Função para traduzir erros de autenticação
const getAuthErrorMessage = (error: any): string => {
  const errorMessage = error?.message || '';
  
  // Mapeamento de erros específicos do Supabase
  if (errorMessage.includes('Invalid login credentials')) {
    return 'Email ou senha incorretos';
  }
  if (errorMessage.includes('Email not confirmed')) {
    return 'Confirme seu email antes de fazer login';
  }
  if (errorMessage.includes('User not found')) {
    return 'Usuário não cadastrado';
  }
  if (errorMessage.includes('Too many requests')) {
    return 'Muitas tentativas. Aguarde alguns minutos';
  }
  if (errorMessage.includes('Invalid email')) {
    return 'Email inválido';
  }
  
  // Erro genérico
  return 'Erro ao fazer login. Tente novamente';
};

// Validação de email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const AuthLayout = () => {
  const { signIn, user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [redirectHandled, setRedirectHandled] = useState(false);

  // Redirecionamento controlado após login bem-sucedido
  useEffect(() => {
    if (user && profile && !isLoading && !redirectHandled) {
      setRedirectHandled(true);
      
      // Pequeno delay para garantir estabilidade
      setTimeout(() => {
        // CRÍTICO: Verificar onboarding primeiro, independente da role
        if (profile.onboarding_completed !== true) {
          navigate('/onboarding', { replace: true });
          return;
        }

        // Só redirecionar para role-specific pages se onboarding estiver completo
        const targetRoute = getUserRoleName(profile) === 'formacao' ? '/formacao' : '/dashboard';
        navigate(targetRoute, { replace: true });
      }, 100);
    }
  }, [user, profile, isLoading, navigate, redirectHandled]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // Validações de front-end
    if (!email || !password) {
      showErrorToast('Campos obrigatórios', 'Por favor, preencha email e senha');
      return;
    }

    if (!isValidEmail(email)) {
      showErrorToast('Email inválido', 'Por favor, insira um email válido');
      return;
    }

    if (password.length < 6) {
      showErrorToast('Senha muito curta', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      setIsSigningIn(true);
      
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('❌ [AUTH-LAYOUT] Erro no login:', error.message);
        
        // Usar helper de toast com mensagem traduzida
        const userFriendlyMessage = getAuthErrorMessage(error);
        showErrorToast('Erro no login', userFriendlyMessage);
        
        return;
      }

      // Sucesso - o toast já é mostrado em useAuthMethods
      
    } catch (err) {
      console.error('❌ [AUTH-LAYOUT] Erro inesperado:', err);
      showErrorToast('Erro inesperado', 'Não foi possível fazer login. Tente novamente');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleResetPasswordClick = () => {
    navigate('/reset-password');
  };

  // Não mostrar formulário se usuário já está logado
  if (user && profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-operational/20 to-surface-base">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <SignInPage
      logoSrc="/lovable-uploads/fe3733f5-092e-4a4e-bdd7-650b71aaa801.png"
      title={<span className="font-light text-foreground tracking-tighter">Bem-vindo</span>}
      description="Acesse a plataforma de soluções e educação de IA"
      heroImageSrc="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=2160&q=80"
      testimonials={loginTestimonials}
      onSignIn={handleFormSubmit}
      onResetPassword={handleResetPasswordClick}
      isLoading={isSigningIn}
    />
  );
};

export default AuthLayout;
