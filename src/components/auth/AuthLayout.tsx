
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import SignUpForm from "./SignUpForm";

const AuthLayout = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuth();

  // Verificar se há token de convite na URL para mostrar registro
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setIsSignUp(true);
    }
  }, [searchParams]);

  // CORREÇÃO CRÍTICA 1: Verificar se usuário já está logado e redirecionar
  useEffect(() => {
    if (user && profile) {
      console.log("[AUTH-LAYOUT] Usuário já autenticado detectado, redirecionando...", {
        email: user.email,
        isAdmin,
        profileRole: profile.role_id
      });
      
      // Redirecionar baseado no papel do usuário
      if (isAdmin || profile.role_id === 'admin') {
        console.log("[AUTH-LAYOUT] Redirecionando admin para /admin");
        navigate('/admin', { replace: true });
      } else if (profile.role_id === 'formacao') {
        console.log("[AUTH-LAYOUT] Redirecionando formação para /formacao");
        navigate('/formacao', { replace: true });
      } else {
        console.log("[AUTH-LAYOUT] Redirecionando usuário comum para /dashboard");
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("[AUTH-LAYOUT] Iniciando processo de login");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("[AUTH-LAYOUT] Erro de autenticação:", error);
        throw error;
      }
      
      if (data.user) {
        console.log("[AUTH-LAYOUT] Login bem-sucedido:", data.user.email);
        toast({
          title: "Login realizado com sucesso",
          description: "Redirecionando...",
        });
        
        // CORREÇÃO CRÍTICA 2: Redirecionar explicitamente para a raiz após login
        console.log("[AUTH-LAYOUT] Redirecionando para / para acionar RootRedirect");
        navigate('/', { replace: true });
      }
      
    } catch (error: any) {
      console.error("[AUTH-LAYOUT] Erro no processo de login:", error);
      
      // Tratar diferentes tipos de erro
      if (error.message?.includes('Invalid login credentials')) {
        toast({
          title: "Credenciais inválidas",
          description: "Email ou senha incorretos. Verifique e tente novamente.",
          variant: "destructive",
        });
      } else if (error.message?.includes('Email not confirmed')) {
        toast({
          title: "Email não confirmado",
          description: "Verifique sua caixa de entrada e confirme seu email.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro de autenticação",
          description: error.message || "Não foi possível fazer login. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      // CORREÇÃO CRÍTICA 3: Timeout mais curto e sempre finalizar loading
      setTimeout(() => {
        setIsLoading(false);
        console.log("[AUTH-LAYOUT] Loading finalizado");
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="mx-auto h-20 w-auto"
          />
        </div>

        {/* Título Principal */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Potencialize com IA
          </h1>
          <p className="text-gray-300 text-lg">
            Transforme seu negócio com inteligência artificial
          </p>
        </div>

        {/* Card de Login/Registro */}
        <AnimatePresence mode="wait">
          {!isSignUp ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 mb-8"
            >
              <div className="text-center pb-4">
                <h2 className="text-2xl text-white mb-2">
                  Acesse sua conta
                </h2>
                <p className="text-gray-300">
                  Entre para acessar suas soluções de IA exclusivas
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-200">Senha</Label>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => console.log("[AUTH-LAYOUT] Reset password clicked")}
                      className="text-xs text-blue-400 hover:text-blue-300 p-0 h-auto"
                    >
                      Esqueceu a senha?
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-300"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold uppercase tracking-wide" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "ENTRAR"
                  )}
                </Button>

                {/* Botão para registro */}
                <Button 
                  type="button" 
                  variant="ghost"
                  className="w-full text-gray-300 hover:text-white"
                  onClick={() => setIsSignUp(true)}
                  disabled={isLoading}
                >
                  Não tenho conta - Criar conta
                </Button>
              </form>
            </motion.div>
          ) : (
            <SignUpForm onBackToLogin={() => setIsSignUp(false)} />
          )}
        </AnimatePresence>

        {/* Seção Inferior - Acesso Exclusivo */}
        <div className="text-center bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">🔒</span>
            <span className="text-white font-semibold">
              Acesso exclusivo para membros convidados
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Esta plataforma é restrita apenas para membros que receberam um convite oficial. 
            Entre em contato conosco se precisar de acesso.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
