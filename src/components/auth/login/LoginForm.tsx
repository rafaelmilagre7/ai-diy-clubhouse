
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import EmailPasswordForm from "./EmailPasswordForm";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success("Login bem-sucedido! Redirecionando...");
        navigate('/dashboard', { replace: true });
      }
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
      
      <div className="text-center text-sm text-white mt-4">
        <p>O acesso à plataforma é exclusivo para membros convidados</p>
      </div>
    </div>
  );
};

export default LoginForm;
