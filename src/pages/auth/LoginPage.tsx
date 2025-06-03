
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { BRAND_ASSETS } from "@/utils/storage/brandAssets";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          ? "Credenciais inválidas. Verifique seu email e senha."
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
              src={BRAND_ASSETS.horizontalLogo}
              alt="VIVER DE IA Club"
              className="h-16 w-auto"
              loading="eager"
              onError={(e) => {
                e.currentTarget.src = "https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif";
              }}
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">
              Bem-vindo de volta
            </h1>
            <p className="text-white/60">
              Entre na sua conta para acessar a plataforma
            </p>
          </div>
        </div>

        {/* Card de Login */}
        <Card className="w-full sm:max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-none">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white">Senha</Label>
                  <Link to="/esqueci-senha" className="text-xs text-white/60 hover:text-white">
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-viverblue hover:bg-viverblue/90" disabled={isLoading}>
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
          </CardContent>
        </Card>

        {/* Rodapé */}
        <div className="mt-8 text-center text-xs text-white/60">
          <p>
            O acesso à plataforma é exclusivo para membros convidados.
          </p>
          <p className="mt-2">
            Se você recebeu um convite,{" "}
            <Link to="/" className="text-viverblue hover:text-viverblue/80">
              clique no link enviado por email
            </Link>
            {" "}para ativar sua conta.
          </p>
        </div>
      </div>
    </div>
  );
}
