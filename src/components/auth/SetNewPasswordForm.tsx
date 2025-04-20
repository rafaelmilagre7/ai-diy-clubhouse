
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Lock } from "lucide-react";

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
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetNewPasswordForm>({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SetNewPasswordForm) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Senha atualizada com sucesso!");
      
      // Aguarda 3 segundos antes de redirecionar
      setTimeout(() => {
        navigate("/login");
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
            onClick={() => navigate("/login")}
            className="w-full bg-viverblue hover:bg-viverblue/90"
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
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
              type="password"
              placeholder="********"
              className="pl-10 w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-viverblue focus:border-viverblue"
              disabled={isLoading}
            />
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
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
              type="password"
              placeholder="********"
              className="pl-10 w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-viverblue focus:border-viverblue"
              disabled={isLoading}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full bg-viverblue hover:bg-viverblue/90 text-white py-2"
            disabled={isLoading}
          >
            {isLoading ? "Atualizando..." : "Atualizar senha"}
          </Button>
        </div>
      </form>
    </div>
  );
};
