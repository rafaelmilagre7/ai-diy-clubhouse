
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import EmailPasswordForm from "./login/EmailPasswordForm";
import GoogleLoginButton from "./login/GoogleLoginButton";
import TestLoginButtons from "./login/TestLoginButtons";
import Divider from "./login/Divider";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      
      // Show toast before starting login for immediate feedback
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

  const handleMemberLogin = () => handleTestLogin(signInAsMember, "membro");
  const handleAdminLogin = () => handleTestLogin(signInAsAdmin, "admin");

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

      <TestLoginButtons
        onMemberLogin={handleMemberLogin}
        onAdminLogin={handleAdminLogin}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LoginForm;
