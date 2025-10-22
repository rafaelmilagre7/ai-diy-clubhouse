import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DeliveryTestResult {
  success: boolean;
  messageId?: string;
  phoneNumber?: string;
  timestamp?: string;
  error?: string;
  details?: any;
}

export function useWhatsAppDeliveryTest() {
  const [testing, setTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<DeliveryTestResult | null>(null);

  const testDelivery = async (testPhone: string) => {
    if (!testPhone) {
      toast.error('Número de teste obrigatório');
      return false;
    }

    setTesting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-test-delivery', {
        body: { 
          testPhone: testPhone,
          message: 'Teste de entrega - Viver de IA'
        }
      });

      if (error) {
        console.error('❌ [DELIVERY-TEST] Erro na função:', error);
        toast.error('Erro ao testar entrega WhatsApp');
        setLastTestResult({
          success: false,
          error: error.message || 'Erro desconhecido'
        });
        return false;
      }

      setLastTestResult(data);

      if (data.success) {
        toast.success(`✅ Teste enviado com sucesso! ID: ${data.messageId}`);
        return true;
      } else {
        toast.error(`❌ Falha no teste: ${data.error}`);
        return false;
      }

    } catch (err: any) {
      console.error('❌ [DELIVERY-TEST] Erro inesperado:', err);
      toast.error('Erro inesperado no teste de entrega');
      setLastTestResult({
        success: false,
        error: err.message || 'Erro inesperado'
      });
      return false;
    } finally {
      setTesting(false);
    }
  };

  const testRealNumbers = async () => {
    const nicholasPhone = '+5548991657016';
    
    const result = await testDelivery(nicholasPhone);
    
    if (result) {
      toast.success('✅ Teste realizado! Verifique o WhatsApp do Nicholas.');
    } else {
      toast.error('❌ Falha no teste para Nicholas.');
    }
    
    return result;
  };

  return {
    testing,
    lastTestResult,
    testDelivery,
    testRealNumbers
  };
}