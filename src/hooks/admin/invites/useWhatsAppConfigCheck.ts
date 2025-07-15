import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface WhatsAppConfigStatus {
  configured: boolean;
  apiConnectivity: boolean;
  readyToSend: boolean;
  issues: string[];
  lastChecked?: string;
}

export function useWhatsAppConfigCheck() {
  const [configStatus, setConfigStatus] = useState<WhatsAppConfigStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const checkWhatsAppConfig = useCallback(async () => {
    setChecking(true);
    
    try {
      console.log('🔍 [CONFIG-CHECK] Verificando configuração do WhatsApp...');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'check' }
      });

      if (error) {
        console.error('❌ [CONFIG-CHECK] Erro na verificação:', error);
        toast.error('Erro ao verificar configuração do WhatsApp');
        return false;
      }

      console.log('✅ [CONFIG-CHECK] Resultado:', data);
      
      const status: WhatsAppConfigStatus = {
        configured: data.status?.configured || false,
        apiConnectivity: data.status?.apiConnectivity || false,
        readyToSend: data.status?.readyToSend || false,
        issues: data.status?.issues || [],
        lastChecked: new Date().toISOString()
      };

      setConfigStatus(status);

      // Feedback para o usuário
      if (status.readyToSend) {
        toast.success('✅ WhatsApp configurado e funcionando!');
      } else if (status.issues.length > 0) {
        toast.error(`❌ WhatsApp precisa de configuração: ${status.issues[0]}`);
      } else {
        toast.warning('⚠️ Status do WhatsApp indefinido');
      }

      return status.readyToSend;

    } catch (err: any) {
      console.error('❌ [CONFIG-CHECK] Erro inesperado:', err);
      toast.error('Erro inesperado ao verificar WhatsApp');
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  const testWhatsAppSend = useCallback(async (testPhone: string) => {
    if (!testPhone) {
      toast.error('Número de teste obrigatório');
      return false;
    }

    setChecking(true);
    
    try {
      console.log('🧪 [TEST-SEND] Testando envio para:', testPhone.substring(0, 5) + '***');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'test-send',
          testPhone 
        }
      });

      if (error) {
        console.error('❌ [TEST-SEND] Erro no teste:', error);
        toast.error('Erro no teste de envio');
        return false;
      }

      if (data.success) {
        toast.success(`✅ Teste enviado! ID: ${data.messageId}`);
        return true;
      } else {
        toast.error(`❌ Falha no teste: ${data.error}`);
        return false;
      }

    } catch (err: any) {
      console.error('❌ [TEST-SEND] Erro inesperado:', err);
      toast.error('Erro inesperado no teste');
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  return {
    configStatus,
    checking,
    checkWhatsAppConfig,
    testWhatsAppSend
  };
}