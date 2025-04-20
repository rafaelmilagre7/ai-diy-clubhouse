
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

const setNewPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type SetNewPasswordForm = z.infer<typeof setNewPasswordSchema>;

export const SetNewPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<SetNewPasswordForm>({
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

      toast.success("Senha atualizada com sucesso!");
      navigate("/login");
    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error);
      toast.error(
        error.message || "Erro ao atualizar senha. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Definir Nova Senha
        </h1>
        <p className="text-muted-foreground mt-2">
          Digite sua nova senha para continuar
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova senha</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="********"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirme a nova senha</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="********"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Atualizando..." : "Atualizar senha"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
