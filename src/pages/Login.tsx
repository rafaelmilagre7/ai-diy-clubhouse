
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const navigate = useNavigate();
  const { user, signInAsMember, signInAsAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Redirecionar usuários já logados
  useEffect(() => {
    if (user) {
      console.log("Usuário já está logado, redirecionando para dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Função para login com email e senha
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success("Login realizado com sucesso!");
        navigate('/dashboard', { replace: true });
      }
      
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      const errorMessage = error.message === "Invalid login credentials"
        ? "Credenciais inválidas. Verifique seu email e senha."
        : error.message || "Ocorreu um erro ao tentar fazer login.";
      
      setError(errorMessage);
      toast.error("Erro ao fazer login", {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para login com Google
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error("Erro ao fazer login com Google:", error);
      setError("Não foi possível fazer login com o Google. Tente novamente.");
      toast.error("Erro no login com Google");
    } finally {
      setIsLoading(false);
    }
  };

  // Funções para logins de teste
  const handleTestLogin = async (loginFn: () => Promise<any>, userType: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await loginFn();
      toast.success(`Login como ${userType} realizado com sucesso!`);
    } catch (err: any) {
      console.error(`Erro ao fazer login como ${userType}:`, err);
      const errorMsg = err?.message || `Ocorreu um erro ao fazer login como ${userType}.`;
      setError(errorMsg);
      toast.error(`Erro no login como ${userType}`, {
        description: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <img
            className="mx-auto h-20 w-auto"
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            VIVER DE IA Club
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Implemente soluções de IA com autonomia e sucesso
          </p>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>
              Acesse sua conta para continuar
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Alerta de erro */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Formulário de Email/Senha */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="username"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    to="/reset-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
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
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continue com
                </span>
              </div>
            </div>
            
            {/* Login com Google */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full"
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              Entrar com Google
            </Button>
            
            {/* Botões de Teste - apenas em desenvolvimento */}
            {process.env.NODE_ENV === 'development' && (
              <div className="space-y-2 pt-4 border-t">
                <p className="text-xs text-center text-muted-foreground">
                  Logins de teste (desenvolvimento)
                </p>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleTestLogin(signInAsMember, "membro")}
                    disabled={isLoading}
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    Login como Membro (Teste)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleTestLogin(signInAsAdmin, "admin")}
                    disabled={isLoading}
                    className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    Login como Admin (Teste)
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              O acesso à plataforma é exclusivo para membros convidados.
            </div>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Não é membro ainda?{" "}
              </span>
              <a
                href="https://milagredigital.com/club/"
                className="font-medium text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Conheça o Club
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
