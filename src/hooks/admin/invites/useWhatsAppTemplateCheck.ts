import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface TemplateCheckResult {
  templateExists: boolean;
  templateStatus: string;
  templateData?: any;
  allTemplates?: Array<{
    name: string;
    status: string;
    language: string;
  }>;
  timestamp: string;
}

export function useWhatsAppTemplateCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckResult, setLastCheckResult] = useState<TemplateCheckResult | null>(null);

  const checkTemplateStatus = async () => {
    if (isChecking) return;

    try {
      setIsChecking(true);
      
      const { data, error } = await supabase.functions.invoke('whatsapp-template-check', {
        body: {}
      });

      if (error) {
        console.error('❌ Erro ao verificar template:', error);
        toast.error('Erro ao verificar status do template');
        throw error;
      }

      const result: TemplateCheckResult = data;
      setLastCheckResult(result);

      if (result.templateExists && result.templateStatus === 'APPROVED') {
        toast.success('✅ Template "convitevia" aprovado e funcionando');
      } else if (result.templateExists && result.templateStatus === 'PENDING') {
        toast.warning('⏳ Template "convitevia" pendente de aprovação');
      } else if (result.templateExists && result.templateStatus === 'REJECTED') {
        toast.error('❌ Template "convitevia" foi rejeitado pelo Meta');
      } else {
        toast.warning('⚠️ Template "convitevia" não encontrado');
      }

      return result;

    } catch (error: any) {
      console.error('❌ Erro na verificação de template:', error);
      toast.error('Erro ao verificar template do WhatsApp');
      throw error;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkTemplateStatus,
    isChecking,
    lastCheckResult
  };
}