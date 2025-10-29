
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { useToastModern } from '@/hooks/useToastModern';
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
  const [hasLoginError, setHasLoginError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { showError } = useToastModern();

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
    setHasLoginError(false);
    setErrorMessage('');
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // Validações de front-end
    if (!email || !password) {
      const message = 'Por favor, preencha e-mail e senha';
      setHasLoginError(true);
      setErrorMessage(message);
      showError('Campos obrigatórios', message, { position: 'top-center', duration: 4000 });
      return;
    }

    if (!isValidEmail(email)) {
      const message = 'Por favor, insira um e-mail válido';
      setHasLoginError(true);
      setErrorMessage(message);
      showError('E-mail inválido', message, { position: 'top-center', duration: 4000 });
      return;
    }

    if (password.length < 6) {
      const message = 'A senha deve ter no mínimo 6 caracteres';
      setHasLoginError(true);
      setErrorMessage(message);
      showError('Senha muito curta', message, { position: 'top-center', duration: 4000 });
      return;
    }

    try {
      setIsSigningIn(true);
      
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('❌ [AUTH-LAYOUT] Erro no login:', error.message);
        
        // Usar mensagem traduzida
        const userFriendlyMessage = getAuthErrorMessage(error);
        setHasLoginError(true);
        setErrorMessage(userFriendlyMessage);
        showError('Erro no login', userFriendlyMessage, { position: 'top-center', duration: 6000 });
        
        // Limpar campo de senha
        const form = event.currentTarget;
        const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
        if (passwordInput) {
          passwordInput.value = '';
        }
        
        return;
      }

      // Sucesso - o toast já é mostrado em useAuthMethods
      
    } catch (err) {
      console.error('❌ [AUTH-LAYOUT] Erro inesperado:', err);
      const message = 'Não foi possível fazer login. Tente novamente';
      setHasLoginError(true);
      setErrorMessage(message);
      showError('Erro inesperado', message, { position: 'top-center', duration: 6000 });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handlePasswordChange = () => {
    setHasLoginError(false);
    setErrorMessage('');
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
      heroImageSrc="/images/hero-login.jpg"
      testimonials={loginTestimonials}
      onSignIn={handleFormSubmit}
      onResetPassword={handleResetPasswordClick}
      isLoading={isSigningIn}
      hasError={hasLoginError}
      errorMessage={errorMessage}
      onPasswordChange={handlePasswordChange}
    />
  );
};

export default AuthLayout;
