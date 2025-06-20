
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useResetPassword = () => {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const resetPassword = async (email: string) => {
    try {
      setIsResetting(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: `Um email de redefinição de senha foi enviado para ${email}.`,
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao enviar reset de senha:', error);
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsResetting(false);
    }
  };

  return { resetPassword, isResetting };
};
