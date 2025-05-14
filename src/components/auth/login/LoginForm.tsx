
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
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
      toast.info("Entrando...");
      
      // Limpar qualquer token existente para evitar conflitos
      try {
        localStorage.removeItem('sb-zotzvtepvpnkcoobdubt-auth-token');
      } catch (e) {
        console.warn("Erro ao limpar localStorage:", e);
      }
      
      // Usar o método signIn do contexto de autenticação em vez de chamar diretamente a API
      const result = await signIn(email, password);
      
      if (result?.error) {
        throw result.error;
      }
      
      // Redirecionamento será tratado pelo contexto de autenticação ou useEffect abaixo
      toast.success("Login bem-sucedido! Redirecionando...");
      
      // Forçar redirecionamento para dashboard após login bem-sucedido
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      setError(error.message === "Invalid login credentials"
        ? "Credenciais inválidas. Verifique seu email e senha."
        : error.message || "Não foi possível fazer login. Verifique suas credenciais.");
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
      
      <div className="text-center text-sm text-white/60 mt-4">
        <p>O acesso à plataforma é exclusivo para membros convidados</p>
      </div>
    </div>
  );
};

export default LoginForm;
