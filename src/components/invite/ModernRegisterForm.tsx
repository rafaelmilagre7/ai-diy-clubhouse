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
        
        // 🎯 MARCAR REGISTRO RECENTE PARA FORÇAR ONBOARDING
        sessionStorage.setItem('registro_recente', 'true');
        sessionStorage.setItem('registro_timestamp', Date.now().toString());
        
        if (inviteToken) {
          console.log('💾 [REGISTER] Dados do convite preservados para onboarding');
        }
        
        // 🎯 REDIRECIONAMENTO DIRETO PARA ONBOARDING
        onSuccess?.();
        console.log('🔗 [REGISTER] Redirecionando para onboarding personalizado');
        
        // Pequeno delay para garantir que os dados foram salvos
        setTimeout(() => {
          redirectToNextStep();
        }, 500);
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
      <div className="text-center space-y-6 py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white">
            Conta criada com sucesso!
          </h3>
          <p className="text-gray-400">
            Redirecionando para seu onboarding...
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Exibir erro se houver */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Nome */}
          <div>
            <Input
              id="name"
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
            />
          </div>

          {/* Email */}
          <div>
            <Input
              id="register-email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!prefilledEmail}
              className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 h-12"
            />
          </div>

          {/* Senha */}
          <div>
            <div className="relative">
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {password && !isPasswordValid && (
              <p className="text-xs text-gray-400 mt-1">
                Use pelo menos 8 caracteres com letras, números e símbolos
              </p>
            )}
          </div>

          {/* Confirmar Senha */}
          <div>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 pr-10 ${
                  confirmPassword && !passwordsMatch ? 'border-red-400' : 
                  confirmPassword && passwordsMatch ? 'border-green-400' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-400 mt-1">
                As senhas não coincidem
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200"
            disabled={isLoading || !isPasswordValid || !passwordsMatch}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Ao se cadastrar, você concorda com nossos termos de uso
          </p>
        </div>
      </div>
    </RateLimitGuard>
  );
};

export default ModernRegisterForm;