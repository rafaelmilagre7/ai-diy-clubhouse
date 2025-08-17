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
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/30 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-white">
            Finalize seu acesso
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Complete seu cadastro para acessar a plataforma
          </p>
          <div className="bg-primary/20 border border-primary/30 rounded-2xl p-4 max-w-sm mx-auto backdrop-blur-sm">
            <p className="text-sm text-white font-medium">
              ⚡ Acesso liberado em menos de 2 minutos
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-medium text-white/90">
            Nome completo
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-12 h-14 bg-white/5 border-white/20 text-white placeholder:text-white/50 rounded-2xl backdrop-blur-sm focus:bg-white/10 focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-3">
          <Label htmlFor="register-email" className="text-sm font-medium text-white/90">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
            <Input
              id="register-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!prefilledEmail}
              className="pl-12 h-14 bg-white/5 border-white/20 text-white placeholder:text-white/50 rounded-2xl backdrop-blur-sm focus:bg-white/10 focus:border-primary/50 transition-all disabled:opacity-60"
            />
          </div>
        </div>

        {/* Senha */}
        <div className="space-y-3">
          <Label htmlFor="register-password" className="text-sm font-medium text-white/90">
            Senha
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="Crie uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 pr-12 h-14 bg-white/5 border-white/20 text-white placeholder:text-white/50 rounded-2xl backdrop-blur-sm focus:bg-white/10 focus:border-primary/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Validação da senha */}
          {password && (
            <div className="bg-white/5 border border-white/20 rounded-2xl p-4 space-y-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/90">Força da senha:</p>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  passwordValidation.strength === 'weak' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  passwordValidation.strength === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                  'bg-green-500/20 text-green-300 border border-green-500/30'
                }`}>
                  {passwordValidation.strength === 'weak' ? 'Fraca' :
                   passwordValidation.strength === 'medium' ? 'Média' : 'Forte'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className={`flex items-center gap-2 ${passwordValidation.length ? 'text-green-300' : 'text-white/50'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.length ? 'text-green-300' : 'text-white/50'}`} />
                  Pelo menos 8 caracteres
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.uppercase ? 'text-green-300' : 'text-white/50'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.uppercase ? 'text-green-300' : 'text-white/50'}`} />
                  Uma letra maiúscula
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.lowercase ? 'text-green-300' : 'text-white/50'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.lowercase ? 'text-green-300' : 'text-white/50'}`} />
                  Uma letra minúscula
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.number ? 'text-green-300' : 'text-white/50'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.number ? 'text-green-300' : 'text-white/50'}`} />
                  Um número
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.special ? 'text-green-300' : 'text-white/50'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.special ? 'text-green-300' : 'text-white/50'}`} />
                  Um caractere especial (!@#$%^&*)
                </div>
              </div>
              
              {passwordValidation.score >= 4 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-3 flex items-center gap-2 backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <p className="text-sm font-medium text-green-300">Senha segura!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmar Senha */}
        <div className="space-y-3">
          <Label htmlFor="confirm-password" className="text-sm font-medium text-white/90">
            Confirmar senha
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-12 pr-12 h-14 bg-white/5 border-white/20 text-white placeholder:text-white/50 rounded-2xl backdrop-blur-sm focus:bg-white/10 focus:border-primary/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Validação de confirmação */}
          {confirmPassword && (
            <div className={`flex items-center gap-2 text-sm ${
              passwordsMatch ? 'text-green-300' : 'text-red-300'
            }`}>
              <CheckCircle className={`h-4 w-4 ${passwordsMatch ? 'text-green-300' : 'text-red-300'}`} />
              {passwordsMatch ? 'Senhas coincidem' : 'As senhas não coincidem'}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-16 font-semibold text-lg transition-all duration-300 group bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/95 hover:to-primary/70 shadow-2xl hover:shadow-primary/25 rounded-2xl text-white border-0"
          disabled={isLoading || !isPasswordValid || !passwordsMatch}
        >
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              Criando sua conta...
            </>
          ) : (
            <>
              🚀 Entrar na comunidade agora
              <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
        </form>

        <div className="text-center">
          <div className="bg-white/5 border border-white/20 rounded-2xl p-6 space-y-3 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 text-primary">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-semibold">Segurança garantida</p>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Seus dados são protegidos com criptografia de nível bancário. 
              Ao se cadastrar, você concorda com nossos{" "}
              <a href="#" className="text-primary hover:text-primary/80 font-medium underline">Termos de Uso</a>
              {" "}e{" "}
              <a href="#" className="text-primary hover:text-primary/80 font-medium underline">Política de Privacidade</a>
            </p>
          </div>
        </div>
      </div>
    </RateLimitGuard>
  );
};

export default ModernRegisterForm;