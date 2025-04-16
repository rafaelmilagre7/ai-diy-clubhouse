
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInAsMember, signInAsAdmin, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn();
      // Navigation is handled by auth state change listeners
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      toast({
        title: "Erro de autenticação",
        description: "Não foi possível fazer login com o Google. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Show immediate feedback toast
      toast({
        title: "Entrando...",
        description: "Autenticando sua conta.",
      });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta ao VIVER DE IA Club!",
        });
        
        // Leave redirect handling to auth state change listeners
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      toast({
        title: "Erro de autenticação",
        description: error.message || "Não foi possível fazer login. Verifique suas credenciais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async (loginFn: () => Promise<void>, userType: string) => {
    try {
      setIsLoading(true);
      
      // Mostra toast antes de iniciar login para feedback imediato
      toast({
        title: `Entrando como ${userType}`,
        description: "Por favor, aguarde...",
      });
      
      await loginFn();
      
      // Leave redirect handling to auth state change listeners
    } catch (error: any) {
      console.error(`Erro ao fazer login como ${userType}:`, error);
      toast({
        title: "Erro de login",
        description: error.message || `Ocorreu um erro ao fazer login como ${userType}.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleEmailSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">
          Email
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">
          Senha
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-viverblue hover:bg-viverblue/90"
        disabled={isLoading}
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>

      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-gray-700 w-full"></div>
        <div className="text-gray-500 bg-black px-2 text-sm">ou</div>
        <div className="border-t border-gray-700 w-full"></div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-white"
        disabled={isLoading}
      >
        <FcGoogle className="mr-2 h-5 w-5" />
        Entrar com Google
      </Button>

      <div className="pt-4 space-y-2">
        <p className="text-center text-gray-500 text-sm mb-2">Acesso de teste</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleTestLogin(signInAsMember, "membro")}
            className="bg-blue-600/30 border-blue-800 hover:bg-blue-700/50 text-white text-xs"
            disabled={isLoading}
          >
            Login Membro (Teste)
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => handleTestLogin(signInAsAdmin, "admin")}
            className="bg-purple-600/30 border-purple-800 hover:bg-purple-700/50 text-white text-xs"
            disabled={isLoading}
          >
            Login Admin (Teste)
          </Button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
