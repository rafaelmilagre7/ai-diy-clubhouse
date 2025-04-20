
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const resetPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ResetPasswordForm>({
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

      toast.success(
        "E-mail de recuperação enviado! Verifique sua caixa de entrada."
      );
      
      // Redireciona para login após 3 segundos
      setTimeout(() => navigate("/login"), 3000);
    } catch (error: any) {
      console.error("Erro ao solicitar reset de senha:", error);
      toast.error(
        error.message || "Erro ao solicitar recuperação de senha. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Recuperar Senha
        </h1>
        <p className="text-muted-foreground mt-2">
          Digite seu e-mail para receber um link de recuperação de senha
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="seu@email.com"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar link de recuperação"}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/login")}
              disabled={isLoading}
            >
              Voltar para login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
