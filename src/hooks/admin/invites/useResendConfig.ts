
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useResendConfig = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);

  const configureResendKey = async (apiKey: string) => {
    setIsConfiguring(true);
    try {
      console.log("🔧 [RESEND-CONFIG] Configurando chave Resend...");
      
      // Testar a Edge Function com a nova chave
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          test: true,
          email: 'test@example.com',
          apiKey // Passar a chave para teste
        }
      });

      if (error) {
        console.error("❌ [RESEND-CONFIG] Erro ao testar configuração:", error);
        throw new Error(`Erro ao configurar: ${error.message}`);
      }

      if (data?.config_check?.has_resend_key) {
        console.log("✅ [RESEND-CONFIG] Chave configurada com sucesso");
        toast.success('Chave Resend configurada com sucesso!');
        return true;
      } else {
        console.error("❌ [RESEND-CONFIG] Configuração falhou:", data);
        throw new Error('Configuração da chave falhou');
      }
    } catch (error: any) {
      console.error("❌ [RESEND-CONFIG] Erro:", error);
      toast.error('Erro ao configurar chave Resend', {
        description: error.message
      });
      return false;
    } finally {
      setIsConfiguring(false);
    }
  };

  return {
    configureResendKey,
    isConfiguring
  };
};
