
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import EmailPasswordForm from "./EmailPasswordForm";
import GoogleLoginButton from "./GoogleLoginButton";
import Divider from "./Divider";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
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
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      
      if (error) throw error;
      
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
