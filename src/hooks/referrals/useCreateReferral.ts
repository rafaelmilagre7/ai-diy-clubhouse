
import { useState } from 'react';
import { createReferral } from '@/lib/supabase/rpc';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import type { ReferralFormData } from '@/lib/supabase/types';

interface ExtendedReferralFormData extends ReferralFormData {
  whatsappNumber?: string;
  useWhatsapp?: boolean;
}

export function useCreateReferral() {
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referralToken, setReferralToken] = useState<string | null>(null);

  const submitReferral = async (data: ExtendedReferralFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Criar indicação no banco de dados
      console.log("Iniciando criação de indicação:", data);
      const result = await createReferral(
        data.email,
        data.type,
        data.notes
      );
      
      console.log("Resultado da criação de indicação:", result);
      
      if (!result.success) {
        setError(result.message || 'Erro ao criar indicação');
        toast.error('Erro ao criar indicação', {
          description: result.message
        });
        return null;
      }
      
      setSuccess(true);
      setReferralToken(result.token || null);
      
      // Preparar mensagem personalizada para WhatsApp/Email
      const typeText = data.type === 'club' ? 'Viver de IA Club' : 'Formação Viver de IA';
      const referrerName = profile?.name || user?.email?.split('@')[0] || 'Um membro do Viver de IA';
      
      // Enviar email/WhatsApp de convite
      console.log("Enviando convite por email/WhatsApp", {
        email: data.email,
        token: result.token,
        useWhatsapp: data.useWhatsapp,
        whatsappNumber: data.whatsappNumber
      });
      
      try {
        const inviteResponse = await supabase.functions.invoke('send-referral-invitation', {
          body: {
            email: data.email,
            referralToken: result.token,
            referrerName: referrerName,
            type: data.type,
            message: data.notes,
            whatsappNumber: data.useWhatsapp ? data.whatsappNumber : undefined,
            useWhatsapp: !!data.useWhatsapp
          }
        });
        
        console.log("Resposta completa do envio de convite:", inviteResponse);
        
        if (inviteResponse.error) {
          console.error("Erro detalhado na resposta da edge function:", inviteResponse.error);
          throw new Error(inviteResponse.error.message || 'Erro ao enviar convite');
        }
        
        const responseData = inviteResponse.data;
        console.log("Dados da resposta do convite:", responseData);
        
        // Verificar os canais que foram enviados com sucesso
        if (responseData?.success) {
          const channels = [];
          if (responseData.channels?.email?.sent) channels.push("e-mail");
          if (responseData.channels?.whatsapp?.sent) channels.push("WhatsApp");
          
          const channelsText = channels.join(" e ");
          
          toast.success('Indicação criada com sucesso!', {
            description: channels.length > 0 
              ? `Um convite foi enviado para ${channelsText}.`
              : 'A indicação foi registrada, mas não foi possível enviar o convite.'
          });
        } else {
          console.warn("Resposta de sucesso, mas sem dados de canais:", responseData);
          toast.warning('Indicação criada, mas o convite não foi enviado', {
            description: 'A pessoa indicada pode se registrar usando o link de convite que você compartilhar.'
          });
        }
      } catch (sendError: any) {
        console.error('Erro detalhado ao enviar convite:', sendError);
        toast.warning('Indicação criada, mas houve um erro ao enviar o convite', {
          description: 'Tente reenviar o convite mais tarde ou compartilhe o link diretamente.'
        });
      }
      
      return result;
    } catch (err: any) {
      console.error('Erro ao submeter indicação:', err);
      setError(err.message);
      toast.error('Erro ao criar indicação', {
        description: err.message
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setError(null);
    setReferralToken(null);
  };

  return {
    submitReferral,
    resetForm,
    isSubmitting,
    success,
    error,
    referralToken
  };
}
