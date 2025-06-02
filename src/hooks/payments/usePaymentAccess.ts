
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

interface PaymentStatus {
  hasActiveSubscription: boolean;
  subscriptionTier: 'basic' | 'premium' | 'enterprise' | null;
  subscriptionEnd: Date | null;
  isTrialActive: boolean;
  trialDaysRemaining: number;
}

export const usePaymentAccess = () => {
  const { user } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    hasActiveSubscription: false,
    subscriptionTier: null,
    subscriptionEnd: null,
    isTrialActive: false,
    trialDaysRemaining: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkPaymentStatus = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Verificar na tabela subscribers (se existir)
      const { data: subscriber } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subscriber) {
        const subscriptionEnd = subscriber.subscription_end 
          ? new Date(subscriber.subscription_end) 
          : null;
        const now = new Date();
        const isActive = subscriptionEnd ? subscriptionEnd > now : false;

        setPaymentStatus({
          hasActiveSubscription: subscriber.subscribed && isActive,
          subscriptionTier: subscriber.subscription_tier as PaymentStatus['subscriptionTier'],
          subscriptionEnd,
          isTrialActive: false, // Implementar lógica de trial se necessário
          trialDaysRemaining: 0
        });
      } else {
        // Usuário sem assinatura - verificar se tem trial disponível
        const { data: profile } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('id', user.id)
          .single();

        if (profile) {
          const accountAge = Date.now() - new Date(profile.created_at).getTime();
          const trialDays = 7;
          const trialPeriod = trialDays * 24 * 60 * 60 * 1000;
          const isTrialActive = accountAge < trialPeriod;
          const trialDaysRemaining = Math.max(0, Math.ceil((trialPeriod - accountAge) / (24 * 60 * 60 * 1000)));

          setPaymentStatus({
            hasActiveSubscription: false,
            subscriptionTier: null,
            subscriptionEnd: null,
            isTrialActive,
            trialDaysRemaining
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status de pagamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPaymentStatus();
  }, [user?.id]);

  const canAccessPremiumCourse = (courseRequiredTier: 'basic' | 'premium' | 'enterprise' = 'basic') => {
    if (paymentStatus.isTrialActive) return true;
    if (!paymentStatus.hasActiveSubscription) return false;
    
    const tierLevels = { basic: 1, premium: 2, enterprise: 3 };
    const userLevel = tierLevels[paymentStatus.subscriptionTier || 'basic'];
    const requiredLevel = tierLevels[courseRequiredTier];
    
    return userLevel >= requiredLevel;
  };

  const initiatePremiumUpgrade = async (targetTier: 'premium' | 'enterprise' = 'premium') => {
    try {
      // Chamar edge function para criar checkout do Stripe
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier: targetTier }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Erro ao iniciar upgrade:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Erro ao abrir portal do cliente:', error);
      throw error;
    }
  };

  return {
    paymentStatus,
    isLoading,
    canAccessPremiumCourse,
    initiatePremiumUpgrade,
    openCustomerPortal,
    refreshPaymentStatus: checkPaymentStatus
  };
};
