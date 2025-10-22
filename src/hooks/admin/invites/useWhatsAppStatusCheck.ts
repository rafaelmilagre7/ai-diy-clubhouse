import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface StatusCheckResult {
  success: boolean;
  checked: number;
  updated: number;
  results: Array<{
    delivery_id: string;
    message_id: string;
    status: string;
    whatsapp_status?: string;
    verified: boolean;
    error?: string;
    reason?: string;
  }>;
  message: string;
}

export function useWhatsAppStatusCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckResult, setLastCheckResult] = useState<StatusCheckResult | null>(null);

  const checkWhatsAppStatus = async () => {
    if (isChecking) return;

    try {
      setIsChecking(true);
      
      const { data, error } = await supabase.functions.invoke('whatsapp-status-check', {
        body: {}
      });

      if (error) {
        console.error('❌ Erro ao verificar status do WhatsApp:', error);
        toast.error('Erro ao verificar status do WhatsApp');
        throw error;
      }

      const result: StatusCheckResult = data;
      setLastCheckResult(result);

      if (result.success) {
        if (result.updated > 0) {
          toast.success(`✅ Status atualizado para ${result.updated} mensagens WhatsApp`);
        } else {
          toast.info(`ℹ️ ${result.message}`);
        }
      } else {
        toast.warning('⚠️ Verificação de status concluída com avisos');
      }

      return result;

    } catch (error: any) {
      console.error('❌ Erro na verificação de status:', error);
      toast.error('Erro ao verificar status das mensagens');
      throw error;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkWhatsAppStatus,
    isChecking,
    lastCheckResult
  };
}