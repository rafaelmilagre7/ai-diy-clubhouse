
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
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      toast.info("Iniciando login com Google...");
      // Chamar signIn sem argumentos para login com Google
      await signIn();
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
      toast.info("Entrando...");
      
      // Usar signIn com email e senha
      await signIn(email, password);
      
      // Navegação é tratada pelo listener de estado de autenticação
      toast.success("Login bem-sucedido! Redirecionando...");
      navigate('/dashboard', { replace: true });
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
