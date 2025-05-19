
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { clearAuthTokens } from '@/contexts/auth';
import EmailPasswordForm from "./EmailPasswordForm";
import GoogleLoginButton from "./GoogleLoginButton";
import Divider from "./Divider";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      toast.info("Iniciando login com Google...");
      
      // Limpar tokens antes
      clearAuthTokens();
      
      // Usando valores vazios para indicar que queremos fazer login com Google
      await signIn("", "");
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      setError("Não foi possível fazer login com o Google. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(undefined);
      
      // Limpar tokens antes
      clearAuthTokens();
      
      toast.info("Entrando...");
      
      // Tentativa de login direta
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success("Login bem-sucedido! Redirecionando...");
        console.log("Login bem-sucedido, redirecionando para dashboard");
        
        // Forçar redirecionamento após autenticação bem-sucedida
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      
      // Mensagens de erro mais amigáveis
      let errorMessage = "Não foi possível fazer login. Verifique suas credenciais.";
      
      if (error.message === "Invalid login credentials") {
        errorMessage = "Credenciais inválidas. Verifique seu email e senha.";
      } else if (error.message === "Email not confirmed") {
        errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <EmailPasswordForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onSubmit={handleEmailSignIn}
        isLoading={isLoading}
        error={error}
      />

      <Divider />

      <GoogleLoginButton 
        onClick={handleGoogleSignIn}
        isLoading={isLoading}
      />
      
      <div className="text-center text-sm text-white mt-4">
        <p>O acesso à plataforma é exclusivo para membros convidados</p>
      </div>
    </div>
  );
};

export default LoginForm;
