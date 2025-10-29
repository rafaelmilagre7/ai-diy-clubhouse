
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Show immediate feedback toast
      toast.loading("Estamos processando seu cadastro...");
      
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
      
      // FRENTE 2: FALLBACK - Verificar se profile foi criado
      if (data?.user) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: profileCheck } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (!profileCheck) {
          console.warn('⚠️ [REGISTER-FALLBACK] Profile não criado - criando manualmente');
          
          const { data: defaultRole } = await supabase
            .from('user_roles')
            .select('id')
            .eq('name', 'membro_club')
            .single();
          
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email!,
            name: name,
            role_id: defaultRole?.id,
            onboarding_completed: false,
            is_master_user: true
          });
          
          try {
            await supabase.rpc('log_orphan_profile_creation', {
              p_user_id: data.user.id,
              p_created_by: 'RegisterForm_fallback',
              p_metadata: { email: data.user.email, timestamp: new Date().toISOString() }
            });
          } catch (err) {
            console.warn('Erro ao logar:', err);
          }
          
          console.log('✅ [REGISTER-FALLBACK] Profile criado manualmente');
        }
      }
      
      // Se há um token de convite, aplicar usando a função correta com onboarding
      if (inviteToken && data.user) {
        try {
          const { data: inviteResult, error: inviteError } = await supabase.rpc('use_invite_with_onboarding', {
            invite_token: inviteToken,
            user_id: data.user.id
          });
          
          if (inviteError) {
            toast.error("Conta criada, mas houve um problema ao aplicar o convite. Entre em contato com o suporte.");
          } else if (inviteResult?.status === 'success') {
            toast.success("Seu convite foi aplicado com sucesso. Redirecionando para o dashboard...");
            
            // Redirecionar para dashboard após sucesso
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 2000);
          }
        } catch (inviteError) {
          toast.error("Conta criada, mas houve um problema ao aplicar o convite.");
        }
      } else {
        // Se não há convite, redirecionar para dashboard
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      }
      
      toast.success("Sua conta foi criada com sucesso!");
      
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      toast.error(error.message || "Não foi possível criar sua conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-md">
      <form onSubmit={handleSubmit} className="space-y-md">
        <div className="space-y-sm">
          <Label htmlFor="name" className="text-foreground">
            Nome completo
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 bg-surface-elevated border-border text-foreground"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-foreground">
            Email
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              id="register-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!prefilledEmail} // Desabilitar edição se email vem do convite
              className="pl-10 bg-surface-elevated border-border text-foreground disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password" className="text-foreground">
            Senha
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="Crie uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-surface-elevated border-border text-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="aurora-primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </div>
  );
};

export default RegisterForm;
