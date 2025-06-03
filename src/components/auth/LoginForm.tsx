
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import EmailPasswordForm from "./login/EmailPasswordForm";
import GoogleLoginButton from "./login/GoogleLoginButton";
import Divider from "./login/Divider";
import { motion } from "framer-motion";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, user } = useAuth();
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
      setError(null);
      toast.info("Iniciando login com Google...", {
        style: {
          background: 'rgba(0, 234, 217, 0.1)',
          border: '1px solid rgba(0, 234, 217, 0.3)',
          color: 'white'
        }
      });
      
      // Usar string vazias para indicar login com Google
      await signIn("", "");
      // Navigation is handled by auth state change listeners
    } catch (error: any) {
      const errorMessage = "Não foi possível fazer login com o Google. Tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage, {
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'white'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      const errorMessage = "Por favor, preencha todos os campos.";
      setError(errorMessage);
      toast.error(errorMessage, {
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'white'
        }
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Show immediate feedback toast
      toast.info("Entrando...", {
        style: {
          background: 'rgba(0, 234, 217, 0.1)',
          border: '1px solid rgba(0, 234, 217, 0.3)',
          color: 'white'
        }
      });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success("Login bem-sucedido! Redirecionando...", {
          style: {
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: 'white'
          }
        });
        
        // Forçar redirecionamento após autenticação bem-sucedida
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      }
    } catch (error: any) {
      let errorMessage = "Não foi possível fazer login. Verifique suas credenciais.";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirme seu email antes de fazer login.";
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "Muitas tentativas de login. Tente novamente em alguns minutos.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'white'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
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
    </motion.div>
  );
};

export default LoginForm;
