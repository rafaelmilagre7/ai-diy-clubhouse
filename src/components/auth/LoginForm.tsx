
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
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Verificar se há parâmetros de convite na URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const emailParam = params.get('email');
    
    if (token) setInviteToken(token);
    if (emailParam) setEmail(emailParam);
  }, [location]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log("Usuário já está logado");
      
      // Se temos um token de convite, processar
      if (inviteToken) {
        processInvite(inviteToken, user.id);
      } else {
        // Caso contrário, redirecionar para dashboard
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, inviteToken, navigate]);

  const processInvite = async (token: string, userId: string) => {
    try {
      toast.info("Processando convite...");
      
      const { data, error } = await supabase.rpc('use_invite', {
        invite_token: token,
        user_id: userId
      });
      
      if (error) {
        console.error("Erro ao processar convite:", error);
        toast.error("Erro ao processar convite", {
          description: error.message || "Ocorreu um erro ao processar o convite."
        });
      } else if (data.status === 'success') {
        toast.success("Convite aceito com sucesso!", {
          description: "Seu acesso foi atualizado."
        });
      }
      
      // Redirecionar para a dashboard após processar o convite
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
      
    } catch (err: any) {
      console.error("Erro ao processar convite:", err);
      toast.error("Erro ao processar convite", {
        description: err.message || "Ocorreu um erro ao processar o convite."
      });
      
      // Redirecionar para a dashboard mesmo com erro
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      toast.info("Iniciando login com Google...");
      
      // Se temos um token de convite, incluí-lo nos parâmetros de redirecionamento
      let redirectOptions = {};
      
      if (inviteToken) {
        // Incluir token no estado de redirecionamento
        redirectOptions = {
          redirectTo: `${window.location.origin}/auth?token=${inviteToken}`
        };
      }
      
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
      
      // Show immediate feedback toast
      toast.info("Entrando...");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success("Login bem-sucedido!");
        
        // Se temos um token de convite, processar
        if (inviteToken) {
          await processInvite(inviteToken, data.user.id);
        } else {
          // Caso contrário, redirecionar para dashboard
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 500);
        }
      }
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
        disableEmailEdit={!!inviteToken && email.length > 0}
      />
      
      {inviteToken && email && (
        <p className="text-sm text-center text-muted-foreground">
          Faça login para aceitar o convite enviado para este email.
        </p>
      )}

      <Divider />

      <GoogleLoginButton 
        onClick={handleGoogleSignIn}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LoginForm;
