
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirecionar usuários já logados
  if (user) {
    const from = location.state?.from?.pathname || "/dashboard";
    navigate(from, { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Login bem-sucedido, o redirecionamento será feito após a atualização do estado de autenticação
      
    } catch (error: any) {
      console.error("Erro de login:", error);
      toast.error("Erro ao fazer login", {
        description: error.message === "Invalid login credentials"
          ? "Email ou senha incorretos. Verifique suas credenciais."
          : error.message || "Ocorreu um erro ao tentar fazer login."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-950 flex items-center justify-center px-4 sm:px-8">
      <div className="w-full flex flex-col items-center">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/logo-viverdeia.svg" 
              alt="Logo Viver de IA"
              className="h-16 w-auto"
              onError={(e) => {
                console.error("Erro ao carregar logo:", e);
                // Fallback para caso a imagem não carregue
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="h-16 w-16 bg-viverblue rounded-lg flex items-center justify-center text-white font-bold text-xl">VIA</div>';
              }}
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">
              Bem-vindo de volta!
            </h2>
            <p className="text-gray-300">
              Entre na sua conta para continuar sua jornada
            </p>
          </div>
        </div>

        {/* Card de Login */}
        <Card className="w-full sm:max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-none">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-viverblue focus:ring-viverblue transition-all duration-200"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-viverblue focus:ring-viverblue transition-all duration-200"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-semibold py-3 transition-all duration-200 transform hover:scale-[1.02]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                className="text-gray-300 hover:text-white text-sm"
                onClick={() => navigate('/reset-password')}
              >
                Esqueceu sua senha?
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rodapé */}
        <div className="mt-8 text-center text-xs text-white/60">
          <p>
            O acesso à plataforma é exclusivo para membros convidados.
          </p>
          <p className="mt-2">
            Se você recebeu um convite,{" "}
            <Link to="/" className="text-viverblue hover:text-viverblue/80 underline">
              clique no link enviado por email
            </Link>
            {" "}para ativar sua conta.
          </p>
        </div>
      </div>
    </div>
  );
}
