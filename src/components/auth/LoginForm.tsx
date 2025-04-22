
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import EmailPasswordForm from "./login/EmailPasswordForm";
import GoogleLoginButton from "./login/GoogleLoginButton";
import Divider from "./login/Divider";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log("Usuário já está logado, redirecionando para dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      toast.info("Iniciando login com Google...");
      // Chamar signIn sem argumentos para login com Google
      await signIn();
      // Navigation is handled by auth state change listeners
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      toast.error("Não foi possível fazer login com o Google. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Show immediate feedback toast
      toast.info("Entrando...");
      
      // Usar signIn com email e senha
      await signIn(email, password);
      
      toast.success("Login bem-sucedido! Redirecionando...");
      console.log("Login bem-sucedido, redirecionando para dashboard");
      
      // Forçar redirecionamento após autenticação bem-sucedida
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      toast.error(error.message || "Não foi possível fazer login. Verifique suas credenciais.");
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
      />

      <Divider />

      <GoogleLoginButton 
        onClick={handleGoogleSignIn}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LoginForm;
