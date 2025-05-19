
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { checkReferral, processReferral } from '@/lib/supabase/rpc';
import { toast } from 'sonner';

export interface ReferralInfo {
  isValid: boolean;
  referralId?: string;
  referrerName?: string;
  type?: string;
  message?: string;
}

export function useRegisterWithReferral() {
  const [referralInfo, setReferralInfo] = useState<ReferralInfo>({
    isValid: false
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkReferralToken = async (token: string) => {
    try {
      setIsChecking(true);
      
      const result = await checkReferral(token);
      
      if (!result.success) {
        setReferralInfo({
          isValid: false,
          message: result.message || 'Token de indicação inválido ou expirado'
        });
        return false;
      }
      
      setReferralInfo({
        isValid: true,
        referralId: result.referral_id,
        referrerName: result.referrer_name,
        type: result.type,
        message: 'Token de indicação válido'
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao verificar token de indicação:', error);
      setReferralInfo({
        isValid: false,
        message: error.message
      });
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const processRegistrationWithReferral = async (token: string, userId: string) => {
    try {
      const result = await processReferral(token, userId);
      
      if (!result.success) {
        console.error('Erro ao processar indicação:', result.message);
        toast.error('Erro ao processar indicação', {
          description: result.message
        });
        return false;
      }
      
      toast.success('Indicação processada com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao processar indicação:', error);
      toast.error('Erro ao processar indicação', {
        description: error.message
      });
      return false;
    }
  };

  return {
    referralInfo,
    isChecking,
    checkReferralToken,
    processRegistrationWithReferral
  };
}
