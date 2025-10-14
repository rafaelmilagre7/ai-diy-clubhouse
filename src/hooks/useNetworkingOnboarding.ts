import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export interface PrefilledData {
  name?: string;
  email?: string;
  company_name?: string;
  current_position?: string;
  industry?: string;
  company_size?: string;
  annual_revenue?: string;
  linkedin_url?: string;
  whatsapp_number?: string;
  professional_bio?: string;
  // Networking preferences antigas
  lookingFor?: {
    types?: string[];
    industries?: string[];
    companySizes?: string[];
  };
}

export const useNetworkingOnboarding = () => {
  const { user, profile } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prefilledData, setPrefilledData] = useState<PrefilledData>({});

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Verificar se já completou onboarding v2
        const { data: profileV2, error: profileError } = await supabase
          .from('networking_profiles_v2')
          .select('id, profile_completed_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') throw profileError;

        const hasCompleted = !!profileV2?.profile_completed_at;
        setHasCompletedOnboarding(hasCompleted);

        // Se NÃO completou, buscar dados existentes para pré-preencher
        if (!hasCompleted) {
          console.log('🔄 [ONBOARDING] Usuário não completou v2, buscando dados para pré-preencher...');
          
          // Buscar dados do profile básico
          const { data: basicProfile } = await supabase
            .from('profiles')
            .select('name, email, company_name, current_position, industry, company_size, annual_revenue, linkedin_url, whatsapp_number, professional_bio')
            .eq('id', user.id)
            .maybeSingle();

          // Buscar preferências antigas de networking
          const { data: oldPreferences } = await supabase
            .from('networking_preferences')
            .select('looking_for')
            .eq('user_id', user.id)
            .maybeSingle();

          const prefilled: PrefilledData = {
            name: basicProfile?.name || profile?.name,
            email: basicProfile?.email || profile?.email || user.email,
            company_name: basicProfile?.company_name,
            current_position: basicProfile?.current_position,
            industry: basicProfile?.industry,
            company_size: basicProfile?.company_size,
            annual_revenue: basicProfile?.annual_revenue,
            linkedin_url: basicProfile?.linkedin_url,
            whatsapp_number: basicProfile?.whatsapp_number,
            professional_bio: basicProfile?.professional_bio,
            lookingFor: oldPreferences?.looking_for as any
          };

          setPrefilledData(prefilled);
          console.log('✅ [ONBOARDING] Dados pré-preenchidos:', Object.keys(prefilled).filter(k => prefilled[k as keyof PrefilledData]));
        }
      } catch (error) {
        console.error('❌ [ONBOARDING] Erro ao verificar:', error);
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, [user, profile]);

  return {
    hasCompletedOnboarding,
    isLoading,
    prefilledData,
    markAsCompleted: () => setHasCompletedOnboarding(true)
  };
};
