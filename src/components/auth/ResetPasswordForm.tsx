
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";

const resetPasswordSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password/update`,
      });

      if (error) throw error;

      // Marcar como enviado mesmo se houver erro, para melhor UX
      setSubmitted(true);
      
      toast.success(
        "E-mail de recuperação enviado! Verifique sua caixa de entrada e spam."
      );
      
    } catch (error: any) {
      console.error("Erro ao solicitar reset de senha:", error);
      
      // Não mostrar erro específico para o usuário por segurança
      toast.error(
        "Se o e-mail estiver registrado em nossa plataforma, você receberá um link de recuperação."
      );
      
      // Ainda marcamos como enviado para não revelar se o email existe ou não
      setSubmitted(true);
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
            onClick={() => navigate("/login")}
            className="w-full text-white border-gray-600 hover:bg-gray-700"
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
            onClick={() => navigate("/login")}
            className="w-full text-white border-gray-600 hover:bg-gray-700"
            disabled={isLoading}
          >
            Voltar para login
          </Button>
        </div>
      </form>
    </div>
  );
};
