
import { useState } from 'react';
import { createReferral } from '@/lib/supabase/rpc';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import type { ReferralFormData } from '@/lib/supabase/types';

export function useCreateReferral() {
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referralToken, setReferralToken] = useState<string | null>(null);

  const submitReferral = async (data: ReferralFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const result = await createReferral(
        data.email,
        data.type,
        data.notes
      );
      
      if (!result.success) {
        setError(result.message || 'Erro ao criar indicação');
        toast.error('Erro ao criar indicação', {
          description: result.message
        });
        return;
      }
      
      setSuccess(true);
      setReferralToken(result.token || null);
      
      // Enviar email de convite
      try {
        await supabase.functions.invoke('send-referral-invitation', {
          body: {
            email: data.email,
            referralToken: result.token,
            referrerName: profile?.name || user?.email,
            type: data.type,
            message: data.notes
          }
        });
        
        toast.success('Indicação criada com sucesso!', {
          description: 'Um e-mail com o convite foi enviado para a pessoa indicada.'
        });
      } catch (emailError: any) {
        console.error('Erro ao enviar email de convite:', emailError);
        toast.warning('Indicação criada, mas houve um erro ao enviar o email', {
          description: 'A pessoa indicada pode se registrar usando o link de convite.'
        });
      }
      
      return result;
    } catch (err: any) {
      console.error('Erro ao submeter indicação:', err);
      setError(err.message);
      toast.error('Erro ao criar indicação', {
        description: err.message
      });
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
