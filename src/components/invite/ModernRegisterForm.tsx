import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface ModernRegisterFormProps {
  inviteToken?: string;
  prefilledEmail?: string;
  onSuccess?: () => void;
}

const ModernRegisterForm: React.FC<ModernRegisterFormProps> = ({ 
  inviteToken, 
  prefilledEmail,
  onSuccess 
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(prefilledEmail || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    };
    return checks;
  };

  const passwordChecks = validatePassword(password);
  const isPasswordValid = Object.values(passwordChecks).every(check => check);

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
    
    if (!isPasswordValid) {
      toast({
        title: "Senha não atende os critérios",
        description: "Por favor, crie uma senha que atenda todos os requisitos.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            invite_token: inviteToken,
          },
          emailRedirectTo: `${window.location.origin}/onboarding`
        },
      });
      
      if (error) throw error;
      
      // Se há um token de convite, aplicar usando a função do Supabase
      if (inviteToken && data.user) {
        try {
          const { data: inviteResult, error: inviteError } = await supabase.rpc('use_invite', {
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
          }
        } catch (inviteError) {
          console.warn('Erro ao aplicar convite:', inviteError);
        }
      }
      
      setStep('success');
      onSuccess?.();
      
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

  if (step === 'success') {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-scale-in">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-heading text-2xl font-bold text-primary">
            Conta criada com sucesso!
          </h3>
          <p className="text-muted-foreground">
            Bem-vindo à comunidade Viver de IA. Você receberá um e-mail de confirmação em breve.
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm font-medium text-primary mb-2">Próximos passos:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Confirme seu e-mail</li>
            <li>• Complete seu perfil</li>
            <li>• Explore a plataforma</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-2xl font-bold">Criar sua conta</h2>
        <p className="text-muted-foreground">
          Preencha os dados abaixo para começar sua jornada
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Nome completo
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="register-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!prefilledEmail}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Senha */}
        <div className="space-y-2">
          <Label htmlFor="register-password" className="text-sm font-medium">
            Senha
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="Crie uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Validação da senha */}
          {password && (
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Sua senha deve conter:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-1 ${passwordChecks.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-2 h-2 rounded-full ${passwordChecks.length ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                  8+ caracteres
                </div>
                <div className={`flex items-center gap-1 ${passwordChecks.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-2 h-2 rounded-full ${passwordChecks.uppercase ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                  Maiúscula
                </div>
                <div className={`flex items-center gap-1 ${passwordChecks.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-2 h-2 rounded-full ${passwordChecks.lowercase ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                  Minúscula
                </div>
                <div className={`flex items-center gap-1 ${passwordChecks.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-2 h-2 rounded-full ${passwordChecks.number ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                  Número
                </div>
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-medium transition-all duration-200 group"
          disabled={isLoading || !isPasswordValid}
        >
          {isLoading ? (
            "Criando conta..."
          ) : (
            <>
              Criar minha conta
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Ao criar sua conta, você concorda com nossos{" "}
          <a href="#" className="text-primary hover:underline">Termos de Uso</a>
          {" "}e{" "}
          <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
        </p>
      </div>
    </div>
  );
};

export default ModernRegisterForm;