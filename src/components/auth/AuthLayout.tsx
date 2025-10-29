
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helpers';
import { useNavigate } from 'react-router-dom';
import { getUserRoleName } from '@/lib/supabase/types';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [redirectHandled, setRedirectHandled] = useState(false);
  const [hasLoginError, setHasLoginError] = useState(false);

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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasLoginError(false);
    
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
        
        // Limpar senha se for erro de credenciais
        if (error.message?.includes('Invalid login credentials')) {
          setPassword('');
          setHasLoginError(true);
        }
        
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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-background via-surface-base to-background">
      {/* Fundo tecnológico sofisticado */}
      <div className="absolute inset-0 w-full h-full">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern" />
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/40" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <Tabs defaultValue="login" className="w-full">
          <TabsContent value="login">
            <Card className="backdrop-blur-lg bg-background/30 border border-border/30 shadow-2xl animate-fade-in">
              <CardHeader className="space-y-1 text-center pb-8">
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-aurora-primary/20 rounded-full blur-xl" />
                    <img
                      src="/lovable-uploads/fe3733f5-092e-4a4e-bdd7-650b71aaa801.png"
                      alt="VIVER DE IA"
                      className="relative h-20 w-auto object-contain hover:scale-105 transition-smooth"
                    />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-foreground mb-2">
                  Bem-vindo de volta
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Acesse a plataforma de soluções e educação de IA da sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground/90 font-medium">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-aurora-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Digite seu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-card/5 border-border/20 text-foreground placeholder:text-muted-foreground focus:bg-card/10 focus:border-aurora-primary/50 transition-smooth rounded-lg"
                        disabled={isSigningIn}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground/90 font-medium">Senha</Label>
                    <div className="relative group">
                      <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
                        hasLoginError 
                          ? 'text-status-error' 
                          : 'text-muted-foreground group-focus-within:text-aurora-primary'
                      }`} />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setHasLoginError(false);
                        }}
                        className={`pl-10 pr-10 h-12 bg-card/5 text-foreground placeholder:text-muted-foreground focus:bg-card/10 transition-smooth rounded-lg ${
                          hasLoginError
                            ? 'border-status-error/50 focus:border-status-error/70 animate-shake'
                            : 'border-border/20 focus:border-aurora-primary/50'
                        }`}
                        disabled={isSigningIn}
                        required
                      />
                      {hasLoginError && (
                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-status-error" />
                      )}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="aurora-primary"
                    className="w-full h-12 font-semibold text-base shadow-lg hover:shadow-aurora-primary/25 transition-smooth hover:scale-[1.02]"
                    disabled={isSigningIn || isLoading}
                  >
                    {isSigningIn ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar na plataforma'
                    )}
                  </Button>
                </form>
                
                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className={`text-sm underline transition-smooth ${
                      hasLoginError
                        ? 'text-aurora-primary hover:text-aurora-primary/80 hover:bg-aurora-primary/10'
                        : 'text-muted-foreground hover:text-aurora-primary hover:bg-surface-elevated/30'
                    }`}
                    onClick={() => navigate('/reset-password')}
                    disabled={isSigningIn}
                  >
                    Esqueci minha senha
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthLayout;
