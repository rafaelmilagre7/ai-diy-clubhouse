import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { RateLimitGuard } from '@/components/security/RateLimitGuard';
import { useRateLimit } from '@/hooks/security/useRateLimit';
import { useSecurityMetrics } from '@/hooks/security/useSecurityMetrics';
import { useToastModern } from '@/hooks/useToastModern';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
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
  const { 
    showError, 
    showSuccess, 
    showWarning, 
    showLoading, 
    dismissToast,
    showErrorWithAction,
    showErrorWithRetry 
  } = useToastModern();
  const [loadingToastId, setLoadingToastId] = useState<string | number | null>(null);

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
      showWarning(
        "Muitas tentativas",
        "Por favor, aguarde alguns minutos antes de tentar novamente",
        { position: 'top-center', duration: 6000 }
      );
      setError('Muitas tentativas. Aguarde antes de tentar novamente.');
      return;
    }
    
    console.log('🚀 [REGISTER] Iniciando processo de registro');
    
    if (!name || !email || !password || !confirmPassword) {
      showError(
        "Campos obrigatórios",
        "Por favor, preencha todos os campos para continuar",
        { position: 'top-center', duration: 4000 }
      );
      return;
    }
    
    if (!passwordsMatch) {
      showError(
        "Senhas diferentes",
        "As senhas digitadas são diferentes. Verifique e tente novamente",
        { position: 'top-center', duration: 5000 }
      );
      return;
    }
    
    // Validar se convite ainda é válido (antes de criar usuário)
    if (inviteToken) {
      try {
        const { data: inviteCheck } = await supabase
          .from('invites')
          .select('id, expires_at, used_at')
          .eq('token', inviteToken.trim())
          .maybeSingle();
        
        // Se não encontrar, tentar validação via RPC como fallback
        if (!inviteCheck) {
          const { data: rpcValidation } = await supabase.rpc('validate_invite_token_safe', {
            p_token: inviteToken.trim()
          });
          
          if (!rpcValidation?.valid) {
            showError(
              "Convite inválido",
              "Este convite não foi encontrado ou já expirou. Solicite um novo convite",
              { position: 'top-center', duration: 6000 }
            );
            setError("Convite não encontrado");
            return;
          }
        }
        
        if (inviteCheck.used_at) {
          showError(
            "Convite já utilizado",
            "Este convite já foi usado por outro usuário. Solicite um novo convite",
            { position: 'top-center', duration: 6000 }
          );
          setError("Convite já utilizado");
          return;
        }
        
        if (new Date(inviteCheck.expires_at) < new Date()) {
          showErrorWithAction(
            "Convite expirado",
            "Este convite expirou. Solicite um novo convite ao administrador",
            {
              label: "Falar com suporte",
              onClick: () => window.open('/suporte', '_blank')
            },
            { position: 'top-center', duration: 8000 }
          );
          setError("Convite expirado");
          return;
        }
        
        console.log('✅ [REGISTER] Convite validado com sucesso');
      } catch (err) {
        console.error('❌ [REGISTER] Erro ao validar convite:', err);
        // Não bloquear cadastro se validação falhar
        console.warn('⚠️ [REGISTER] Continuando sem validação prévia');
      }
    }
    
    if (!isPasswordValid) {
      await logSecurityViolation('weak_password_attempt', 'low', 'Tentativa de registro com senha fraca', {
        passwordScore: passwordValidation.score,
        passwordStrength: passwordValidation.strength
      });
      showWarning(
        "Senha fraca",
        "Por favor, crie uma senha que atenda pelo menos 4 dos 5 requisitos de segurança",
        { position: 'top-center', duration: 6000 }
      );
      return;
    }

    // Validação adicional no servidor
    const serverValidation = await validatePasswordOnServer(password);
    if (serverValidation && !serverValidation.is_valid) {
      console.log('❌ [REGISTER] Senha rejeitada pelo servidor:', serverValidation);
      showWarning(
        "Senha muito comum",
        "Esta senha é conhecida e fácil de adivinhar. Evite senhas comuns como 'senha123' ou 'password'",
        { position: 'top-center', duration: 8000 }
      );
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 🎯 PRESERVAR TOKEN NO SESSIONSTORAGE
      if (inviteToken) {
        sessionStorage.setItem('current_invite_token', inviteToken.trim());
        console.log('💾 [REGISTER] Token salvo no sessionStorage:', inviteToken.substring(0, 6) + '***');
      }
      
      const toastId = showLoading(
        "Criando sua conta...",
        "Por favor, aguarde enquanto preparamos tudo para você",
        { position: 'top-center', duration: Infinity }
      );
      setLoadingToastId(toastId);
      
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
        if (loadingToastId) dismissToast(loadingToastId);
        
        // Tratamento específico para usuário já existente
        if (error.message?.includes("User already registered") || error.message?.includes("already been registered")) {
          setError("Este email já possui uma conta. Tente fazer login ou use 'Esqueci minha senha'.");
          showErrorWithAction(
            "E-mail já cadastrado",
            "Este e-mail já está cadastrado na plataforma. Faça login ou recupere sua senha",
            {
              label: "Ir para login",
              onClick: () => window.location.href = '/login'
            },
            { position: 'top-center', duration: 8000 }
          );
          return;
        }
        
        // Verificar se é erro de rate limit de email
        if (error.message?.includes("email rate limit exceeded")) {
          // Usar a nova função do backend para lidar com rate limit
          try {
            const { data: rateLimitInfo } = await supabase.rpc('handle_supabase_email_rate_limit_error', {
              error_message: error.message
            });
            
            if (rateLimitInfo) {
              setError(rateLimitInfo.user_message);
              showError(
                "Limite de e-mails atingido",
                rateLimitInfo.user_message || "Muitas tentativas de envio de e-mail. Aguarde alguns minutos",
                { position: 'top-center', duration: 8000 }
              );
              
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
        let errorTitle = "Erro no cadastro";
        
        if (error.message?.includes("User already registered")) {
          errorTitle = "E-mail já cadastrado";
          userMessage = "Este e-mail já possui uma conta. Tente fazer login ou usar 'Esqueci minha senha'";
        } else if (error.message?.includes("signup disabled")) {
          errorTitle = "Cadastro desabilitado";
          userMessage = "O cadastro está temporariamente desabilitado. Entre em contato com o suporte";
        } else if (error.message?.includes("refresh_token")) {
          errorTitle = "Erro de sessão";
          userMessage = "Problema com a sessão detectado. Recarregue a página e tente novamente";
        } else if (error.message?.includes("rate limit")) {
          errorTitle = "Muitas tentativas";
          userMessage = "Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente";
        } else {
          userMessage = error.message || "Erro desconhecido. Tente novamente";
        }
        
        setError(userMessage);
        showError(errorTitle, userMessage, { position: 'top-center', duration: 8000 });
        
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
        console.log('✅ [REGISTER] Usuário criado:', data.user.id);
        
        // FALLBACK ROBUSTO: Aguardar trigger + verificar criação
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Verificar se profile foi criado (com retry)
        let profileCreated = false;
        for (let i = 0; i < 3; i++) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();
          
          if (profile) {
            profileCreated = true;
            break;
          }
          
          if (i < 2) await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (!profileCreated) {
          console.warn('⚠️ [REGISTER] Profile não criado após 3 tentativas - fluxo pode ter problema');
          if (loadingToastId) dismissToast(loadingToastId);
          showErrorWithRetry(
            "Erro ao criar perfil",
            "Houve um atraso na criação da sua conta. Aguarde alguns instantes e tente fazer login",
            () => window.location.href = '/login',
            { position: 'top-center', duration: 8000 }
          );
          return;
        }
        
        // 🚀 INVALIDAR CACHE DO REACT QUERY para forçar recarga dos dados de onboarding
        console.log('[REGISTER] ♻️ Invalidando cache de onboarding...');
        await queryClient.invalidateQueries({ queryKey: ['onboarding'] });
        console.log('[REGISTER] ✅ Cache invalidado com sucesso');
        
        if (loadingToastId) dismissToast(loadingToastId);
        showSuccess(
          "Conta criada com sucesso!",
          "🎉 Bem-vindo à plataforma! Redirecionando...",
          { 
            position: 'bottom-right',
            highlightTitle: true,
            duration: 4000 
          }
        );
        
        // Sucesso - chamar callback
        onSuccess?.();
      }
      
    } catch (error: any) {
      console.error('❌ [REGISTER] Erro:', error);
      if (loadingToastId) dismissToast(loadingToastId);
      const errorMessage = error.message || "Erro ao criar conta. Tente novamente";
      showError(
        "Erro inesperado",
        errorMessage,
        { position: 'top-center', duration: 6000 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // REMOVIDO: handleAlternativeSignup - sem fallbacks ou recovery

  if (step === 'success') {
    return (
      <div className="text-center space-y-xl py-3xl">
          <div className="relative">
            <div className="w-24 h-24 bg-operational rounded-full flex items-center justify-center mx-auto animate-bounce shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-revenue rounded-full flex items-center justify-center animate-ping">
              <span className="text-xs">🎉</span>
            </div>
          </div>
        
        <div className="space-y-4">
          <h3 className="font-heading text-3xl font-bold bg-operational text-white bg-clip-text p-2 rounded">
            Bem-vindo à elite da IA empresarial!
          </h3>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Sua conta foi criada com sucesso. Você agora faz parte da comunidade mais exclusiva de transformação digital do Brasil.
          </p>
        </div>

        <div className="bg-operational/10 dark:bg-operational/5 border-2 border-operational/30 dark:border-operational/20 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-sm font-semibold text-operational dark:text-operational mb-4">🚀 Seus próximos passos:</p>
          <ul className="text-sm text-operational/90 dark:text-operational/80 space-y-2 text-left">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-operational" />
              Confirme seu e-mail (chegará em até 2 min)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-operational" />
              Complete seu cadastro
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-operational" />
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
          <div className="w-16 h-16 bg-operational/20 to-operational/30 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-operational/20">
            <User className="h-8 w-8 text-operational" />
          </div>
          <h2 className="font-heading text-xl font-bold text-white">
            Finalize seu acesso
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Complete seu cadastro para acessar a plataforma
          </p>
          <div className="bg-operational/20 border border-operational/30 rounded-lg p-2 max-w-xs mx-auto backdrop-blur-sm">
            <p className="text-xs text-operational font-medium">
              ⚡ Acesso liberado em menos de 2 minutos
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
        {/* Exibir erro se houver */}
        {error && (
          <div className="bg-status-error/10 border border-status-error/20 rounded-2xl p-4 mb-6 backdrop-blur-sm">
            <p className="text-sm text-status-error font-medium">⚠️ {error}</p>
            <button 
              onClick={() => setError("")}
              className="text-xs text-status-error/80 hover:text-status-error mt-2 underline"
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
              className="pl-10 h-11 bg-surface-elevated/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-lg backdrop-blur-sm focus:bg-surface-elevated focus:border-operational/50 transition-all"
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
              className="pl-10 h-11 bg-surface-elevated/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-lg backdrop-blur-sm focus:bg-surface-elevated focus:border-operational/50 transition-all disabled:opacity-60"
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
              className="pl-10 pr-10 h-11 bg-surface-elevated/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-lg backdrop-blur-sm focus:bg-surface-elevated focus:border-operational/50 transition-all"
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
                <div className={`flex items-center gap-1 ${passwordValidation.length ? 'text-system-healthy' : 'text-muted-foreground'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.length ? 'text-system-healthy' : 'text-muted-foreground'}`} />
                  8+ caracteres
                </div>
                <div className={`flex items-center gap-1 ${passwordValidation.uppercase ? 'text-system-healthy' : 'text-muted-foreground'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.uppercase ? 'text-system-healthy' : 'text-muted-foreground'}`} />
                  Maiúscula
                </div>
                <div className={`flex items-center gap-1 ${passwordValidation.lowercase ? 'text-system-healthy' : 'text-muted-foreground'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.lowercase ? 'text-system-healthy' : 'text-muted-foreground'}`} />
                  Minúscula
                </div>
                <div className={`flex items-center gap-1 ${passwordValidation.number ? 'text-system-healthy' : 'text-muted-foreground'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.number ? 'text-system-healthy' : 'text-muted-foreground'}`} />
                  Número
                </div>
                <div className={`flex items-center gap-1 col-span-2 ${passwordValidation.special ? 'text-system-healthy' : 'text-muted-foreground'}`}>
                  <CheckCircle className={`h-3 w-3 ${passwordValidation.special ? 'text-system-healthy' : 'text-muted-foreground'}`} />
                  Especial (!@#$%)
                </div>
              </div>
              
              {passwordValidation.score >= 4 && (
                <div className="bg-system-healthy/10 border border-system-healthy/30 rounded-lg p-2 flex items-center gap-2 backdrop-blur-sm">
                  <CheckCircle className="h-3 w-3 text-system-healthy" />
                  <p className="text-xs font-medium text-system-healthy">Senha segura!</p>
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
              className="pl-10 pr-10 h-11 bg-surface-elevated/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-lg backdrop-blur-sm focus:bg-surface-elevated focus:border-system-healthy/50 transition-all"
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
              passwordsMatch ? 'text-system-healthy' : 'text-status-error'
            }`}>
              <CheckCircle className={`h-3 w-3 ${passwordsMatch ? 'text-system-healthy' : 'text-status-error'}`} />
              {passwordsMatch ? 'Senhas coincidem' : 'As senhas não coincidem'}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-semibold text-base transition-all duration-300 group bg-gradient-to-r from-system-healthy via-system-healthy/90 to-operational hover:from-system-healthy/90 hover:via-system-healthy/80 hover:to-operational/90 shadow-lg hover:shadow-system-healthy/25 rounded-lg text-white border-0"
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
            <div className="flex items-center justify-center gap-2 text-system-healthy">
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