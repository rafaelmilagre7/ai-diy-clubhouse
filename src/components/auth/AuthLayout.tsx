
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getUserRoleName } from '@/lib/supabase/types';

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
        const targetRoute = getUserRoleName(profile) === 'formacao' ? '/formacao' : '/dashboard';
        console.log("🔄 [AUTH-LAYOUT] Redirecionando para:", targetRoute);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0ABAB5] mx-auto mb-4"></div>
          <p>Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">VIVER DE IA</h1>
          <p className="text-gray-400">Acesse sua conta</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-1 bg-gray-800 border-gray-700">
            <TabsTrigger value="login" className="text-white">Entrar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Bem-vindo de volta</CardTitle>
                <CardDescription className="text-gray-400">
                  Entre com suas credenciais para acessar o club
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      disabled={isSigningIn}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      disabled={isSigningIn}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-white"
                    disabled={isSigningIn || isLoading}
                  >
                    {isSigningIn ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthLayout;
