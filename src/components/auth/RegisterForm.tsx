
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import Divider from "./login/Divider";
import GoogleLoginButton from "./login/GoogleLoginButton";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar se há parâmetros de convite na URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const emailParam = params.get('email');
    
    if (token) setInviteToken(token);
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Show immediate feedback toast
      toast({
        title: "Criando conta...",
        description: "Estamos processando seu cadastro.",
      });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) throw error;
      
      // Aguardar um pouco para garantir que o perfil do usuário foi criado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Se temos um token de convite, processar após o registro
      if (inviteToken && data.user) {
        try {
          toast({
            title: "Processando convite...",
            description: "Estamos atualizando seus acessos."
          });
          
          const { data: inviteData, error: inviteError } = await supabase.rpc('use_invite', {
            invite_token: inviteToken,
            user_id: data.user.id
          });
          
          if (inviteError) {
            console.error("Erro ao processar convite:", inviteError);
            toast({
              title: "Cadastro realizado",
              description: "Sua conta foi criada, mas houve um erro ao processar seu convite. Entre em contato com o administrador.",
              variant: "default"
            });
          } else if (inviteData.status === 'success') {
            toast({
              title: "Sucesso!",
              description: "Sua conta foi criada e o convite foi aceito com sucesso!",
            });
          }
        } catch (inviteErr) {
          console.error("Erro ao processar convite após registro:", inviteErr);
        }
      } else {
        toast({
          title: "Cadastro realizado",
          description: "Sua conta foi criada com sucesso!",
        });
      }
      
      // Redirecionar para a dashboard ou página inicial
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      // Se temos um token de convite, incluí-lo nos parâmetros de redirecionamento
      let redirectOptions = {};
      
      if (inviteToken) {
        // Incluir token no estado de redirecionamento
        redirectOptions = {
          redirectTo: `${window.location.origin}/auth?token=${inviteToken}`
        };
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: redirectOptions
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

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">
            Nome completo
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-white">
            Email
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="register-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
              disabled={!!inviteToken && email.length > 0} // Desabilitar se vier de um convite
            />
          </div>
          {inviteToken && email && (
            <p className="text-sm text-muted-foreground">
              Este email foi informado no convite e não pode ser alterado.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password" className="text-white">
            Senha
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="Crie uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-viverblue hover:bg-viverblue/90"
          disabled={isLoading}
        >
          {isLoading ? "Criando conta..." : "Criar conta"}
        </Button>
        
        {inviteToken && (
          <p className="text-sm text-center text-muted-foreground">
            Você está se cadastrando através de um convite. Seu acesso será configurado automaticamente.
          </p>
        )}
      </form>

      <Divider />

      <GoogleLoginButton onClick={handleGoogleSignIn} isLoading={isLoading} />
    </div>
  );
};

export default RegisterForm;
