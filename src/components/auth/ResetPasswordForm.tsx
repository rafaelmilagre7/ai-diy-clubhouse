
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, AlertTriangle, Check, Loader2 } from "lucide-react";
import { APP_CONFIG } from "@/config/app";

const resetPasswordSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onBackToLogin?: () => void;
}

export const ResetPasswordForm = ({ onBackToLogin }: ResetPasswordFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: "",
    },
  });

  const email = watch('email');

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Iniciando reset de senha para:", data.email);
      
      // Usar sempre o domínio personalizado para reset de senha
      const redirectUrl = APP_CONFIG.getAppUrl('/set-new-password');
      
      console.log("URL de redirecionamento:", redirectUrl);
      
      // Usar nossa edge function em vez do método nativo do Supabase
      const { error } = await supabase.functions.invoke('send-reset-password-email', {
        body: {
          email: data.email,
          resetUrl: redirectUrl
        }
      });

      console.log("Resposta da edge function:", { error });

      if (error) {
        console.error("Erro detalhado no reset de senha:", error);
        
        // Verificar se o erro está relacionado ao e-mail não verificado
        if (error.message && error.message.includes("not verified")) {
          setError("Erro de configuração: O e-mail de envio não está verificado. Por favor, contacte o administrador.");
          toast.error("Erro de configuração no servidor de e-mail. Entre em contato com o suporte.");
          return;
        }
        
        throw error;
      }

      setSubmitted(true);
      
      toast.success(
        "E-mail de recuperação enviado! Verifique sua caixa de entrada e spam."
      );
      
    } catch (error: any) {
      console.error("Erro completo ao solicitar reset de senha:", error);
      
      // Não revelar se o e-mail existe ou não por segurança
      setError(
        "Não foi possível enviar o e-mail de recuperação. Verifique se o e-mail está correto ou tente novamente mais tarde."
      );
      
      toast.error(
        "Erro ao enviar e-mail de recuperação. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-6">
        <div className="rounded-full bg-status-success/20 p-4 w-20 h-20 mx-auto flex items-center justify-center">
          <Check className="h-10 w-10 text-status-success" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium text-white">E-mail enviado!</h3>
          <p className="text-muted-foreground text-sm">
            Se o e-mail estiver registrado em nossa plataforma, você receberá um link para redefinir sua senha em alguns minutos.
          </p>
        </div>
        
        <div className="bg-operational/30 border border-operational rounded-lg p-4 text-left">
          <h4 className="text-operational-light font-medium mb-2">📧 Próximos passos:</h4>
          <ul className="text-operational-light/80 text-sm space-y-1">
            <li>• Verifique sua caixa de entrada</li>
            <li>• Não se esqueça de checar a pasta de spam</li>
            <li>• O link expira em 5 minutos por segurança</li>
            <li>• Caso não receba, tente novamente</li>
          </ul>
        </div>
        
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBackToLogin ? onBackToLogin : () => navigate("/login")}
            className="w-full text-white bg-gray-700 hover:bg-gray-600 border-gray-600"
          >
            Voltar para login
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSubmitted(false);
              setError(null);
            }}
            className="w-full text-aurora-primary hover:bg-aurora-primary/10"
          >
            Enviar para outro e-mail
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white text-center">
          Recuperar Senha
        </h1>
        <p className="text-muted-foreground mt-2 text-center">
          Digite seu e-mail para receber um link de recuperação
        </p>
      </div>

      {error && (
        <div className="bg-status-error/20 border border-status-error rounded-md p-3 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-status-error shrink-0 mt-0.5" />
          <p className="text-sm text-status-error">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            E-mail cadastrado
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              {...register("email")}
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              className={`pl-10 w-full py-3 px-3 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-aurora-primary focus:border-aurora-primary transition-colors ${
                errors.email ? 'border-status-error' : 
                email && isValid ? 'border-status-success' : 'border-gray-600'
              }`}
              disabled={isLoading}
            />
            
            {/* Feedback visual para email válido */}
            {email && isValid && !errors.email && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Check className="h-5 w-5 text-status-success" />
              </div>
            )}
          </div>
          
          {errors.email && (
            <p className="text-status-error text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {errors.email.message}
            </p>
          )}
          
          {/* Dica para o usuário */}
          <p className="text-gray-400 text-xs">
            Digite o e-mail que você usou para criar sua conta
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <Button
            type="submit"
            variant={isValid && !isLoading ? "aurora-primary" : "secondary"}
            className="w-full py-3 font-medium"
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando link...
              </>
            ) : (
              "Enviar link de recuperação"
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onBackToLogin ? onBackToLogin : () => navigate("/login")}
            className="w-full text-white bg-gray-700 hover:bg-gray-600 border-gray-600"
            disabled={isLoading}
          >
            Voltar para login
          </Button>
        </div>
      </form>
    </div>
  );
};
