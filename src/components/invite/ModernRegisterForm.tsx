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

// Removido hook de telemetria para simplificação

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
  
  // Removido hook de telemetria para simplificação

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
        
        // Verificar se é erro de rate limit de email
        if (error.message?.includes("email rate limit exceeded")) {
          // Usar a nova função do backend para lidar com rate limit
          try {
            const { data: rateLimitInfo } = await supabase.rpc('handle_supabase_email_rate_limit_error', {
              error_message: error.message
            });
            
            if (rateLimitInfo) {
              setError(rateLimitInfo.user_message);
              toast({
                title: "Limite de email atingido",
                description: rateLimitInfo.user_message,
                variant: "destructive",
              });
              
              // Log da tentativa para monitoramento
              await supabase.rpc('log_registration_attempt', {
                p_email: email,
                p_success: false,
                p_error_details: {
                  error_type: 'email_rate_limit',
                  error_message: error.message,
                  timestamp: new Date().toISOString()
                }
              });
              
              return;
            }
          } catch (rateLimitError) {
            console.error('Erro ao processar rate limit:', rateLimitError);
          }
        }
        
        let userMessage = "Não foi possível criar sua conta. ";
        if (error.message?.includes("User already registered")) {
          userMessage = "Este email já possui uma conta. Tente fazer login ou usar 'Esqueci minha senha'.";
        } else if (error.message?.includes("signup disabled")) {
          userMessage = "O cadastro está temporariamente desabilitado. Entre em contato com o suporte.";
        } else if (error.message?.includes("refresh_token")) {
          userMessage = "Problema com a sessão detectado. Recarregue a página e tente novamente.";
        } else if (error.message?.includes("rate limit")) {
          userMessage = "Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.";
        } else {
          userMessage += `Erro: ${error.message}`;
        }
        
        setError(userMessage);
        toast({
          title: "Erro no cadastro",
          description: userMessage,
          variant: "destructive",
        });
        
        // Log da tentativa para monitoramento
        try {
          await supabase.rpc('log_registration_attempt', {
            p_email: email,
            p_success: false,
            p_error_details: {
              error_message: error.message,
              timestamp: new Date().toISOString()
            }
          });
        } catch (logError) {
          console.error('Erro ao registrar tentativa:', logError);
        }
        
        return;
      }
      
      if (data?.user) {
        console.log('✅ [REGISTER] Usuário criado - trigger handle_new_user automaticamente criou perfil');
        
        toast({
          title: "Conta criada com sucesso! 🎉",
          description: "Bem-vindo à plataforma!",
        });
        
        // Sucesso - chamar callback
        onSuccess?.();
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
          <div className="w-24 h-24 bg-gradient-to-br from-operational to-operational-dark rounded-full flex items-center justify-center mx-auto animate-bounce shadow-lg">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-revenue rounded-full flex items-center justify-center animate-ping">
            <span className="text-xs">🎉</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-heading text-3xl font-bold bg-gradient-to-r from-operational to-operational-light bg-clip-text text-transparent">
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
              Complete seu cadastro
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
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <User className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="font-heading text-xl font-bold text-white">
            Finalize seu acesso
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Complete seu cadastro para acessar a plataforma
          </p>
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-2 max-w-xs mx-auto backdrop-blur-sm">
            <p className="text-xs text-emerald-400 font-medium">
              ⚡ Acesso liberado em menos de 2 minutos
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
        {/* Exibir erro se houver */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 backdrop-blur-sm">
            <p className="text-sm text-red-200 font-medium">⚠️ {error}</p>
            <button 
              onClick={() => setError("")}
              className="text-xs text-red-300 hover:text-red-100 mt-2 underline"
            >
              Dispensar
            </button>
          </div>
        )}

        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-medium text-white/90">
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
              className="pl-10 h-11 bg-surface-elevated/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-lg backdrop-blur-sm focus:bg-surface-elevated focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-xs font-medium text-white/90">
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
              className="pl-10 h-11 bg-surface-elevated/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-lg backdrop-blur-sm focus:bg-surface-elevated focus:border-emerald-500/50 transition-all disabled:opacity-60"
            />
          </div>
        </div>

        {/* Senha */}
        <div className="space-y-2">
          <Label htmlFor="register-password" className="text-xs font-medium text-white/90">
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
              className="pl-10 pr-10 h-11 bg-surface-elevated/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-lg backdrop-blur-sm focus:bg-surface-elevated focus:border-emerald-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Validação da senha - mais compacta */}
          {password && (
            <div className="bg-card/30 border border-border/30 rounded-lg p-3 space-y-2 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-foreground/90">Força da senha:</p>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  passwordValidation.strength === 'weak' ? 'bg-status-error/20 text-status-error border border-status-error/30' :
                  passwordValidation.strength === 'medium' ? 'bg-status-warning/20 text-status-warning border border-status-warning/30' :
                  'bg-operational/20 text-operational border border-operational/30'
                }`}>
                  {passwordValidation.strength === 'weak' ? 'Fraca' :
                   passwordValidation.strength === 'medium' ? 'Média' : 'Forte'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className={`flex items-center gap-1 ${passwordValidation.length ? 'text-emerald-300' : 'text-white/50'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.length ? 'text-emerald-300' : 'text-white/50'}`} />
                  8+ caracteres
                </div>
                <div className={`flex items-center gap-1 ${passwordValidation.uppercase ? 'text-emerald-300' : 'text-white/50'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.uppercase ? 'text-emerald-300' : 'text-white/50'}`} />
                  Maiúscula
                </div>
                <div className={`flex items-center gap-1 ${passwordValidation.lowercase ? 'text-emerald-300' : 'text-white/50'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.lowercase ? 'text-emerald-300' : 'text-white/50'}`} />
                  Minúscula
                </div>
                <div className={`flex items-center gap-1 ${passwordValidation.number ? 'text-emerald-300' : 'text-white/50'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.number ? 'text-emerald-300' : 'text-white/50'}`} />
                  Número
                </div>
                <div className={`flex items-center gap-1 col-span-2 ${passwordValidation.special ? 'text-emerald-300' : 'text-white/50'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.special ? 'text-emerald-300' : 'text-white/50'}`} />
                  Especial (!@#$%)
                </div>
              </div>
              
              {passwordValidation.score >= 4 && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 flex items-center gap-2 backdrop-blur-sm">
                  <CheckCircle className="h-3 w-3 text-emerald-300" />
                  <p className="text-xs font-medium text-emerald-300">Senha segura!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmar Senha */}
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-xs font-medium text-white/90">
            Confirmar senha
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10 h-11 bg-surface-elevated/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-lg backdrop-blur-sm focus:bg-surface-elevated focus:border-emerald-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Validação de confirmação */}
          {confirmPassword && (
            <div className={`flex items-center gap-2 text-xs ${
              passwordsMatch ? 'text-emerald-300' : 'text-red-300'
            }`}>
              <CheckCircle className={`h-3 w-3 ${passwordsMatch ? 'text-emerald-300' : 'text-red-300'}`} />
              {passwordsMatch ? 'Senhas coincidem' : 'As senhas não coincidem'}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-semibold text-base transition-all duration-300 group bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-700 hover:via-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-emerald-500/25 rounded-lg text-white border-0"
          disabled={isLoading || !isPasswordValid || !passwordsMatch}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Criando sua conta...
            </>
          ) : (
            <>
              🚀 Entrar na comunidade agora
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
        </form>

        <div className="text-center">
          <div className="bg-card/30 border border-border/30 rounded-lg p-4 space-y-2 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <p className="text-xs font-semibold">Segurança garantida</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Seus dados são protegidos com criptografia de nível bancário.
            </p>
          </div>
        </div>
      </div>
    </RateLimitGuard>
  );
};

export default ModernRegisterForm;