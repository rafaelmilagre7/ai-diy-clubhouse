
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, AlertTriangle } from "lucide-react";
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
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

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
        <div className="rounded-full bg-viverblue/20 p-3 w-16 h-16 mx-auto flex items-center justify-center">
          <Mail className="h-8 w-8 text-viverblue" />
        </div>
        
        <h3 className="text-xl font-medium text-white">Confira seu e-mail</h3>
        
        <p className="text-gray-300">
          Se o e-mail estiver registrado em nossa plataforma, você receberá um link para redefinir sua senha.
        </p>
        
        <div className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBackToLogin ? onBackToLogin : () => navigate("/login")}
            className="w-full text-white bg-gray-700 hover:bg-gray-600 border-gray-600"
          >
            Voltar para login
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
        <p className="text-gray-300 mt-2 text-center">
          Digite seu e-mail para receber um link de recuperação
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-600 rounded-md p-3 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-200">
            E-mail
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register("email")}
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="pl-10 w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-viverblue focus:border-viverblue"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-4 pt-2">
          <Button
            type="submit"
            className="w-full bg-viverblue hover:bg-viverblue/90 text-white py-2"
            disabled={isLoading}
          >
            {isLoading ? "Enviando..." : "Enviar link de recuperação"}
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
