
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Lock, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { performCleanupAndRedirect } from "@/utils/authStateCleanup";
import { validatePassword } from "@/utils/passwordValidation";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { PasswordRequirements } from "@/components/ui/password-requirements";

const setNewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type SetNewPasswordForm = z.infer<typeof setNewPasswordSchema>;

export const SetNewPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessingTokens, setIsProcessingTokens] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SetNewPasswordForm>({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const passwordValidation = validatePassword(password || '');
  const passwordsMatch = password === confirmPassword && password.length > 0;

  // Processar tokens de reset da URL
  useEffect(() => {
    const processResetTokens = async () => {
      try {
        setIsProcessingTokens(true);
        setSessionError(null);

        // Função para extrair parâmetros do hash
        const getTokensFromHash = () => {
          const hash = window.location.hash.substring(1); // Remove o #
          const params = new URLSearchParams(hash);
          return {
            accessToken: params.get('access_token'),
            refreshToken: params.get('refresh_token'),
            type: params.get('type'),
          };
        };

        // Verificar se existem tokens na URL (query params ou hash)
        let accessToken = searchParams.get('access_token');
        let refreshToken = searchParams.get('refresh_token');
        let type = searchParams.get('type');

        // Se não encontrou nos query params, tentar no hash
        if (!accessToken) {
          const hashTokens = getTokensFromHash();
          accessToken = hashTokens.accessToken;
          refreshToken = hashTokens.refreshToken;
          type = hashTokens.type;
        }

        console.log('🔍 [RESET-PASSWORD] Verificando tokens na URL:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type 
        });

        if (!accessToken || !refreshToken || type !== 'recovery') {
          // Sem tokens válidos - verificar se já existe uma sessão ativa
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            setSessionError('Link de redefinição inválido ou expirado');
            setIsValidSession(false);
            return;
          }
          
          // Sessão já existe, pode proceder
          console.log('✅ [RESET-PASSWORD] Sessão ativa encontrada');
          setIsValidSession(true);
          return;
        }

        // Estabelecer sessão com os tokens da URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          console.error('❌ [RESET-PASSWORD] Erro ao estabelecer sessão:', error);
          setSessionError('Link de redefinição inválido ou expirado');
          setIsValidSession(false);
          return;
        }

        if (!data.session) {
          setSessionError('Não foi possível estabelecer sessão de redefinição');
          setIsValidSession(false);
          return;
        }

        console.log('✅ [RESET-PASSWORD] Sessão de reset estabelecida com sucesso');
        setIsValidSession(true);

      } catch (error: any) {
        console.error('❌ [RESET-PASSWORD] Erro inesperado:', error);
        setSessionError('Erro ao processar link de redefinição');
        setIsValidSession(false);
      } finally {
        setIsProcessingTokens(false);
      }
    };

    processResetTokens();
  }, [searchParams]);

  const onSubmit = async (data: SetNewPasswordForm) => {
    if (!isValidSession) {
      toast.error("Sessão inválida. Solicite um novo link de redefinição.");
      return;
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Senha atualizada com sucesso!");
      
      // Fazer logout completo da sessão temporária e redirecionar
      setTimeout(async () => {
        await performCleanupAndRedirect('/login', 'password_reset_completed');
      }, 3000);
      
    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error);
      toast.error(
        error.message || "Erro ao atualizar senha. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Estado de processamento de tokens
  if (isProcessingTokens) {
    return (
      <div className="text-center space-y-6">
        <div className="rounded-full bg-aurora-primary/20 p-3 w-16 h-16 mx-auto flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-aurora-primary animate-spin" />
        </div>
        
        <h3 className="text-xl font-medium text-white">Verificando link de redefinição...</h3>
        
        <p className="text-gray-300">
          Aguarde enquanto validamos seu link de redefinição de senha.
        </p>
      </div>
    );
  }

  // Estado de erro na sessão
  if (sessionError || !isValidSession) {
    return (
      <div className="text-center space-y-6">
        <div className="rounded-full bg-red-500/20 p-3 w-16 h-16 mx-auto flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        
        <h3 className="text-xl font-medium text-white">Link inválido</h3>
        
        <p className="text-gray-300">
          {sessionError || "O link de redefinição é inválido ou expirou. Solicite um novo link."}
        </p>
        
        <div className="pt-4">
          <Button
            type="button"
            variant="aurora-primary"
            onClick={() => navigate("/reset-password")}
            className="w-full"
          >
            Solicitar novo link
          </Button>
        </div>
      </div>
    );
  }

  // Estado de sucesso
  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="rounded-full bg-green-500/20 p-3 w-16 h-16 mx-auto flex items-center justify-center">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        
        <h3 className="text-xl font-medium text-white">Senha atualizada!</h3>
        
        <p className="text-gray-300">
          Sua senha foi alterada com sucesso. Você será redirecionado para a página de login.
        </p>
        
        <div className="pt-4">
          <Button
            type="button"
            variant="aurora-primary"
            onClick={() => performCleanupAndRedirect('/login', 'manual_redirect_from_reset')}
            className="w-full"
          >
            Ir para login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white text-center">
          Definir Nova Senha
        </h1>
        <p className="text-gray-300 mt-2 text-center">
          Digite sua nova senha para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="password" className="block text-sm font-medium text-gray-200">
            Nova senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua nova senha"
              className={`pl-10 pr-12 w-full py-3 px-3 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-aurora-primary focus:border-aurora-primary transition-colors ${
                password && !passwordValidation.isValid ? 'border-red-500' : 
                password && passwordValidation.isValid ? 'border-green-500' : 'border-gray-600'
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Indicador de força da senha */}
          {password && password.length > 0 && (
            <PasswordStrengthIndicator 
              strength={passwordValidation.strength} 
              className="mt-3"
            />
          )}
          
          {errors.password && (
            <p className="text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
            Confirme a nova senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register("confirmPassword")}
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Digite novamente sua nova senha"
              className={`pl-10 pr-12 w-full py-3 px-3 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-aurora-primary focus:border-aurora-primary transition-colors ${
                confirmPassword && !passwordsMatch ? 'border-red-500' : 
                confirmPassword && passwordsMatch ? 'border-green-500' : 'border-gray-600'
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Feedback visual de confirmação */}
          {confirmPassword && confirmPassword.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              {passwordsMatch ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-green-400">As senhas coincidem</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-400">As senhas não coincidem</span>
                </>
              )}
            </div>
          )}
          
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Requisitos da senha */}
        {password && password.length > 0 && (
          <PasswordRequirements 
            requirements={passwordValidation.requirements}
            className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
          />
        )}

        <div className="pt-4">
          <Button
            type="submit"
            className={`w-full py-3 font-medium transition-all ${
              passwordValidation.isValid && passwordsMatch 
                ? 'bg-aurora-primary hover:bg-aurora-primary/90 text-white' 
                : 'bg-gray-600 text-gray-300 cursor-not-allowed hover:bg-gray-600'
            }`}
            disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando senha...
              </>
            ) : (
              "Atualizar senha"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
