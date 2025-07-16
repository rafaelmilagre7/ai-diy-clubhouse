import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { RateLimitGuard } from '@/components/security/RateLimitGuard';
import { useRateLimit } from '@/hooks/security/useRateLimit';
import { useSecurityMetrics } from '@/hooks/security/useSecurityMetrics';
import { useOnboardingRedirect } from '@/hooks/useOnboardingRedirect';
import { useInviteFlowTelemetry } from '@/hooks/useInviteFlowTelemetry';

interface ModernRegisterFormProps {
  inviteToken?: string;
  prefilledEmail?: string;
  prefilledName?: string;
  onSuccess?: () => void;
}

const ModernRegisterForm: React.FC<ModernRegisterFormProps> = ({ 
  inviteToken, 
  prefilledEmail,
  prefilledName,
  onSuccess 
}) => {
  const [name, setName] = useState(prefilledName || "");
  const [email, setEmail] = useState(prefilledEmail || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<'form' | 'success'>('form');
  const { checkRateLimit } = useRateLimit();
  const { logSecurityViolation } = useSecurityMetrics();
  const { redirectToNextStep } = useOnboardingRedirect();
  const { trackRegistrationStarted, trackRegistrationCompleted, trackProfileCreated, trackOnboardingRedirected } = useInviteFlowTelemetry();

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    const strength = score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong';
    
    return { ...checks, score, strength };
  };

  // Validação de senha no servidor
  const validatePasswordOnServer = async (password: string) => {
    try {
      const { data, error } = await supabase.rpc('validate_password_strength_server', {
        password: password
      });
      
      if (error) {
        console.error('Erro na validação de senha:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Erro ao validar senha no servidor:', err);
      return null;
    }
  };

  const passwordValidation = validatePassword(password);
  const isPasswordValid = passwordValidation.score >= 4; // Requer pelo menos 4 critérios
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit first - mais permissivo para convites válidos
    const rateLimitAllowed = await checkRateLimit('invite_registration', {
      maxAttempts: 10, // Mais tentativas para convites
      windowMinutes: 60 // Janela maior
    });

    if (!rateLimitAllowed) {
      toast({
        title: "Muitas tentativas",
        description: "Aguarde alguns minutos antes de tentar novamente.",
        variant: "destructive",
      });
      setError('Rate limit atingido. Aguarde antes de tentar novamente.');
      return;
    }
    
    console.log('🚀 [REGISTER] Iniciando processo de registro');
    
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    
    if (!passwordsMatch) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas são diferentes. Verifique e tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isPasswordValid) {
      await logSecurityViolation('weak_password_attempt', 'low', 'Tentativa de registro com senha fraca', {
        passwordScore: passwordValidation.score,
        passwordStrength: passwordValidation.strength
      });
      toast({
        title: "Senha não atende os critérios",
        description: "Por favor, crie uma senha que atenda pelo menos 4 dos 5 requisitos.",
        variant: "destructive",
      });
      return;
    }

    // Validação adicional no servidor
    const serverValidation = await validatePasswordOnServer(password);
    if (serverValidation && !serverValidation.is_valid) {
      console.log('❌ [REGISTER] Senha rejeitada pelo servidor:', serverValidation);
      toast({
        title: "Senha muito fraca",
        description: "Sua senha não atende aos critérios de segurança. Evite senhas comuns e use uma combinação mais forte.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 🎯 PRESERVAR TOKEN NO SESSIONSTORAGE
      if (inviteToken) {
        sessionStorage.setItem('current_invite_token', inviteToken.trim());
        console.log('💾 [REGISTER] Token salvo no sessionStorage:', inviteToken.substring(0, 6) + '***');
      }
      
      toast({
        title: "Criando sua conta...",
        description: "Por favor, aguarde enquanto preparamos tudo para você.",
      });
      
      // 🎯 NOVO FLUXO SIMPLIFICADO: Apenas signUp - o trigger handle_new_user cuida do resto
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
            full_name: name.trim(),
            display_name: name.trim(),
            ...(inviteToken && { invite_token: inviteToken.trim() })
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      console.log('📊 [REGISTER] Resultado do signUp:', {
        hasData: !!data,
        hasUser: !!data?.user,
        userId: data?.user?.id,
        userEmail: data?.user?.email,
        hasError: !!error,
        errorMessage: error?.message
      });
      
      if (error) {
        console.error('❌ [REGISTER] Erro no signUp:', error);
        
        let userMessage = "Não foi possível criar sua conta. ";
        if (error.message?.includes("User already registered")) {
          userMessage = "Este email já possui uma conta. Tente fazer login ou usar 'Esqueci minha senha'.";
        } else if (error.message?.includes("signup disabled")) {
          userMessage = "O cadastro está temporariamente desabilitado. Entre em contato com o suporte.";
        } else if (error.message?.includes("refresh_token")) {
          userMessage = "Problema com a sessão detectado. Recarregue a página e tente novamente.";
        } else {
          userMessage += `Erro: ${error.message}`;
        }
        
        setError(userMessage);
        toast({
          title: "Erro no cadastro",
          description: userMessage,
          variant: "destructive",
        });
        return;
      }
      
      if (data?.user) {
        console.log('✅ [REGISTER] Usuário criado - trigger handle_new_user automaticamente criou perfil');
        
        toast({
          title: "Conta criada com sucesso!",
          description: "Preparando seu onboarding personalizado...",
        });
        
        // 🎯 REDIRECIONAMENTO DIRETO
        onSuccess?.();
        const redirectUrl = inviteToken 
          ? `/onboarding/step/1?token=${encodeURIComponent(inviteToken.trim())}`
          : '/onboarding/step/1';
        console.log('🔗 [REGISTER] Redirecionando para:', redirectUrl);
        window.location.href = redirectUrl;
      }
      
    } catch (error: any) {
      console.error('❌ [REGISTER] Erro:', error);
      const errorMessage = error.message || "Erro ao criar conta. Tente novamente.";
      toast({
        title: "Erro inesperado",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // REMOVIDO: handleAlternativeSignup - sem fallbacks ou recovery

  if (step === 'success') {
    return (
      <div className="text-center space-y-8 py-12">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-lg">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-ping">
            <span className="text-xs">🎉</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-heading text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            Bem-vindo à elite da IA empresarial!
          </h3>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Sua conta foi criada com sucesso. Você agora faz parte da comunidade mais exclusiva de transformação digital do Brasil.
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-4">🚀 Seus próximos passos:</p>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-2 text-left">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Confirme seu e-mail (chegará em até 2 min)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Complete seu onboarding personalizado
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Acesse conteúdos exclusivos da comunidade
            </li>
          </ul>
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 max-w-sm mx-auto">
          <p className="text-sm font-medium text-primary">
            ⏱️ Redirecionando automaticamente em alguns segundos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <RateLimitGuard 
      actionType="invite_registration" 
      maxAttempts={10} 
      windowMinutes={15}
      showWarning={true}
    >
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-heading text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Finalize seu acesso
          </h2>
          <p className="text-muted-foreground text-lg">
            Últimos passos para entrar na comunidade mais exclusiva de IA empresarial
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 max-w-sm mx-auto">
            <p className="text-sm text-primary font-medium">
              ⚡ Acesso liberado em menos de 2 minutos
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Exibir erro se houver */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800 font-medium">⚠️ {error}</p>
            <button 
              onClick={() => setError("")}
              className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
            >
              Dispensar
            </button>
          </div>
        )}

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
            <div className="bg-gradient-to-br from-muted/20 to-muted/30 border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Força da senha:</p>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  passwordValidation.strength === 'weak' ? 'bg-red-100 text-red-700' :
                  passwordValidation.strength === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {passwordValidation.strength === 'weak' ? 'Fraca' :
                   passwordValidation.strength === 'medium' ? 'Média' : 'Forte'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className={`flex items-center gap-2 ${passwordValidation.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.length ? 'text-green-600' : 'text-muted-foreground'}`} />
                  Pelo menos 8 caracteres
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.uppercase ? 'text-green-600' : 'text-muted-foreground'}`} />
                  Uma letra maiúscula
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.lowercase ? 'text-green-600' : 'text-muted-foreground'}`} />
                  Uma letra minúscula
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.number ? 'text-green-600' : 'text-muted-foreground'}`} />
                  Um número
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.special ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.special ? 'text-green-600' : 'text-muted-foreground'}`} />
                  Um caractere especial (!@#$%^&*)
                </div>
              </div>
              
              {passwordValidation.score >= 4 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-xs font-medium text-green-700">Senha segura!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmar Senha */}
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-sm font-medium">
            Confirmar senha
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10 h-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Validação de confirmação */}
          {confirmPassword && (
            <div className={`flex items-center gap-2 text-sm ${
              passwordsMatch ? 'text-green-600' : 'text-red-600'
            }`}>
              <CheckCircle className={`h-4 w-4 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`} />
              {passwordsMatch ? 'Senhas coincidem' : 'As senhas não coincidem'}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-14 font-semibold text-lg transition-all duration-200 group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl"
          disabled={isLoading || !isPasswordValid || !passwordsMatch}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              Criando sua conta...
            </>
          ) : (
            <>
              🚀 Entrar na comunidade agora
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
        </form>

        <div className="text-center">
        <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-4 w-4" />
            <p className="text-sm font-medium">Segurança garantida</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Seus dados são protegidos com criptografia de nível bancário. 
            Ao se cadastrar, você concorda com nossos{" "}
            <a href="#" className="text-primary hover:underline font-medium">Termos de Uso</a>
            {" "}e{" "}
            <a href="#" className="text-primary hover:underline font-medium">Política de Privacidade</a>
          </p>
        </div>
        </div>
      </div>
    </RateLimitGuard>
  );
};

export default ModernRegisterForm;