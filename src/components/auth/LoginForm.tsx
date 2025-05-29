
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import EmailPasswordForm from "./login/EmailPasswordForm";
import { motion } from "framer-motion";
import { cleanupAuthState } from "@/utils/authUtils";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log("Usuário já logado, redirecionando para dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      const errorMessage = "Por favor, preencha todos os campos.";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Iniciando processo de login para:", email);
      
      // Limpar estado anterior
      cleanupAuthState();
      
      // Mostrar feedback imediato
      toast.info("Verificando credenciais...");
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      console.log("Resposta do Supabase:", { 
        user: data.user?.id, 
        session: !!data.session,
        error: signInError?.message 
      });
      
      if (signInError) {
        console.error("Erro de autenticação:", signInError);
        throw signInError;
      }
      
      if (data.user && data.session) {
        console.log("Login bem-sucedido!");
        toast.success("Login realizado com sucesso!");
        
        // Aguardar um pouco para o contexto de auth atualizar
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      } else {
        throw new Error("Dados de sessão inválidos");
      }
    } catch (error: any) {
      console.error("Erro durante o login:", error);
      
      let errorMessage = "Não foi possível fazer login. Verifique suas credenciais.";
      
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos. Verifique suas credenciais e tente novamente.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirme seu email antes de fazer login.";
      } else if (error.message?.includes("Too many requests")) {
        errorMessage = "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.";
      } else if (error.message?.includes("signup is disabled")) {
        errorMessage = "O cadastro está desabilitado. Entre em contato com o suporte.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
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

      {/* Debug Info - apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-3 bg-gray-800/50 rounded-lg text-xs text-gray-400"
        >
          <p className="mb-2 font-semibold">Credenciais de teste:</p>
          <p>• Membro: user@teste.com / 123456</p>
          <p>• Admin: admin@teste.com / 123456</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LoginForm;
