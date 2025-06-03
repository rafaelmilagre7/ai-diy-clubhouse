
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirecionar usuários já logados
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        toast.error("Credenciais inválidas", {
          description: "Verifique seu email e senha e tente novamente."
        });
      }
    } catch (error: any) {
      console.error("Erro de login:", error);
      toast.error("Erro ao fazer login", {
        description: "Ocorreu um erro inesperado. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return null; // Evita flash durante redirecionamento
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-blue-800/20 backdrop-blur-3xl"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Mensagem de boas-vindas */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
              Viver de IA Club
            </h1>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">
              Bem-vindo de volta!
            </h2>
            <p className="text-purple-200/80 text-lg">
              Entre na sua conta para continuar sua jornada com IA
            </p>
          </div>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:bg-white/15">
          <CardHeader className="space-y-6 pb-8">
            <div className="text-center">
              <h3 className="text-xl font-medium text-white mb-2">Fazer Login</h3>
              <p className="text-purple-200/70">
                Acesse sua conta para continuar
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-purple-300 transition-colors group-focus-within:text-purple-200" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "pl-11 h-12 bg-white/10 border-white/20 text-white placeholder:text-purple-300/60",
                      "focus:bg-white/15 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/30",
                      "transition-all duration-300 hover:bg-white/12"
                    )}
                    placeholder="seu@email.com"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">Senha</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-purple-300 transition-colors group-focus-within:text-purple-200" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      "pl-11 pr-11 h-12 bg-white/10 border-white/20 text-white placeholder:text-purple-300/60",
                      "focus:bg-white/15 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/30",
                      "transition-all duration-300 hover:bg-white/12"
                    )}
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-purple-300 hover:text-purple-200 transition-colors duration-200"
                    disabled={isLoading}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className={cn(
                  "w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600",
                  "text-white font-medium transition-all duration-300 transform hover:scale-[1.02]",
                  "shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Entrar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-purple-200/70 text-sm">
                Acesso exclusivo para membros convidados
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-purple-200/60 text-sm">
            Transforme sua vida profissional com Inteligência Artificial
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
