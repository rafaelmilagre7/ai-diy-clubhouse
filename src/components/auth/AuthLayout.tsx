
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getUserRoleName } from '@/lib/supabase/types';
import { Loader2, Mail, Lock } from 'lucide-react';

const AuthLayout = () => {
  const { signIn, user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [redirectHandled, setRedirectHandled] = useState(false);

  // Redirecionamento controlado após login bem-sucedido
  useEffect(() => {
    if (user && profile && !isLoading && !redirectHandled) {
      console.log("✅ [AUTH-LAYOUT] Usuário logado, redirecionando...", {
        user: user.email,
        role: getUserRoleName(profile)
      });
      
      setRedirectHandled(true);
      
      // Pequeno delay para garantir estabilidade
      setTimeout(() => {
        // CRÍTICO: Verificar onboarding primeiro, independente da role
        if (profile.onboarding_completed !== true) {
          console.log("📝 [AUTH-LAYOUT] Usuário precisa completar onboarding - redirecionando");
          navigate('/onboarding', { replace: true });
          return;
        }

        // Só redirecionar para role-specific pages se onboarding estiver completo
        const targetRoute = getUserRoleName(profile) === 'formacao' ? '/formacao' : '/dashboard';
        console.log("🔄 [AUTH-LAYOUT] Onboarding completo - redirecionando para:", targetRoute);
        navigate(targetRoute, { replace: true });
      }, 100);
    }
  }, [user, profile, isLoading, navigate, redirectHandled]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      setIsSigningIn(true);
      console.log('🔄 [AUTH-LAYOUT] Tentando fazer login:', email);
      
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('❌ [AUTH-LAYOUT] Erro no login:', error.message);
        toast.error('Erro no login', {
          description: error.message === 'Invalid login credentials' 
            ? 'Email ou senha incorretos' 
            : error.message
        });
        return;
      }

      console.log('✅ [AUTH-LAYOUT] Login realizado com sucesso');
      toast.success('Login realizado com sucesso!');
      
    } catch (err) {
      console.error('❌ [AUTH-LAYOUT] Erro inesperado:', err);
      toast.error('Erro inesperado no login');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Não mostrar formulário se usuário já está logado
  if (user && profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white/80">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-4 relative overflow-hidden">
      {/* Elementos de fundo animados */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-viverblue/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <Tabs defaultValue="login" className="w-full">
          <TabsContent value="login">
            <Card className="backdrop-blur-lg bg-black/30 border border-white/10 shadow-2xl animate-fade-in">
              <CardHeader className="space-y-1 text-center pb-8">
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-viverblue/20 rounded-full blur-xl animate-pulse" />
                    <img
                      src="/lovable-uploads/fe3733f5-092e-4a4e-bdd7-650b71aaa801.png"
                      alt="VIVER DE IA Club"
                      className="relative h-20 w-auto object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-white mb-2">
                  Bem-vindo de volta
                </CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  Acesse sua conta do VIVER DE IA Club
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90 font-medium">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-viverblue transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Digite seu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-viverblue/50 transition-all duration-200 rounded-lg"
                        disabled={isSigningIn}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90 font-medium">Senha</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-viverblue transition-colors" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-viverblue/50 transition-all duration-200 rounded-lg"
                        disabled={isSigningIn}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-viverblue to-blue-600 hover:from-viverblue-dark hover:to-blue-700 text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-viverblue/25 transition-all duration-300 hover:scale-[1.02]"
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
                    className="text-white/70 hover:text-viverblue hover:bg-white/5 text-sm underline"
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
