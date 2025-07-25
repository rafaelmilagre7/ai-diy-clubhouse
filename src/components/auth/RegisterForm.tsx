
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface RegisterFormProps {
  inviteToken?: string;
  prefilledEmail?: string;
}

const RegisterForm = ({ inviteToken, prefilledEmail }: RegisterFormProps = {}) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(prefilledEmail || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
            invite_token: inviteToken, // Incluir o token de convite nos metadados
          },
          emailRedirectTo: `${window.location.origin}/auth`
        },
      });
      
      if (error) throw error;
      
      // Se há um token de convite, aplicar usando a função correta com onboarding
      if (inviteToken && data.user) {
        try {
          const { data: inviteResult, error: inviteError } = await supabase.rpc('use_invite_with_onboarding', {
            invite_token: inviteToken,
            user_id: data.user.id
          });
          
          if (inviteError) {
            console.error('Erro ao aplicar convite:', inviteError);
            toast({
              title: "Aviso",
              description: "Conta criada, mas houve um problema ao aplicar o convite. Entre em contato com o suporte.",
              variant: "destructive",
            });
          } else if (inviteResult?.status === 'success') {
            toast({
              title: "Convite aplicado!",
              description: "Seu convite foi aplicado com sucesso. Redirecionando para o dashboard...",
            });
            
            // Redirecionar para dashboard após sucesso
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 2000);
          }
        } catch (inviteError) {
          console.warn('Erro ao aplicar convite:', inviteError);
          toast({
            title: "Aviso",
            description: "Conta criada, mas houve um problema ao aplicar o convite.",
            variant: "destructive",
          });
        }
      } else {
        // Se não há convite, redirecionar para dashboard
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      }
      
      toast({
        title: "Cadastro realizado",
        description: "Sua conta foi criada com sucesso!",
      });
      
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
              disabled={!!prefilledEmail} // Desabilitar edição se email vem do convite
              className="pl-10 bg-gray-800 border-gray-700 text-white disabled:opacity-50"
            />
          </div>
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
      </form>
    </div>
  );
};

export default RegisterForm;
