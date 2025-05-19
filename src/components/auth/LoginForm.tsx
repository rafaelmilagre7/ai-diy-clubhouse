
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obter a rota para redirecionamento após login
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log("Usuário já está logado, redirecionando para:", from);
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      toast.info("Iniciando login com Google...");
      
      // Limpar tokens existentes para garantir login limpo
      localStorage.removeItem('sb-zotzvtepvpnkcoobdubt-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      // Usar string vazias para indicar login com Google
      await signIn("", "");
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
      
      // Limpar tokens existentes para garantir login limpo
      localStorage.removeItem('sb-zotzvtepvpnkcoobdubt-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      // Show immediate feedback toast
      toast.info("Entrando...");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success("Login bem-sucedido! Redirecionando...");
        console.log("Login bem-sucedido, redirecionando para:", from);
        
        // Forçar redirecionamento após autenticação bem-sucedida
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      
      let errorMessage = "Não foi possível fazer login. Verifique suas credenciais.";
      
      if (error.message === "Invalid login credentials") {
        errorMessage = "Credenciais inválidas. Verifique seu email e senha.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
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
