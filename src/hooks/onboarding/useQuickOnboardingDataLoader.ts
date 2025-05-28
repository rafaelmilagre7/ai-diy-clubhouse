
import { useState, useEffect } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

const initialData: QuickOnboardingData = {
  // Etapa 1: Informações Pessoais
  name: '',
  email: '',
  whatsapp: '',
  country_code: '+55',
  birth_date: '',
  instagram_url: '',
  linkedin_url: '',
  how_found_us: '',
  referred_by: '',

  // Etapa 2: Negócio
  company_name: '',
  role: '',
  company_size: '',
  company_segment: '',
  company_website: '',
  annual_revenue_range: '',
  main_challenge: '',

  // Etapa 3: Experiência com IA
  ai_knowledge_level: '',
  uses_ai: '',
  main_goal: '',

  // Campos adicionais para compatibilidade
  desired_ai_areas: [],
  has_implemented: '',
  previous_tools: []
};

export const useQuickOnboardingDataLoader = () => {
  const { user } = useAuth();
  const [data, setData] = useState<QuickOnboardingData>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadExistingData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔄 Carregando dados existentes do onboarding...');
        
        // Buscar dados na tabela quick_onboarding
        const { data: quickData, error: quickError } = await supabase
          .from('quick_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (quickData && !quickError) {
          console.log('✅ Dados encontrados na quick_onboarding:', quickData);
          setData({
            name: quickData.name || '',
            email: quickData.email || user.email || '',
            whatsapp: quickData.whatsapp || '',
            country_code: quickData.country_code || '+55',
            birth_date: quickData.birth_date || '',
            instagram_url: quickData.instagram_url || '',
            linkedin_url: quickData.linkedin_url || '',
            how_found_us: quickData.how_found_us || '',
            referred_by: quickData.referred_by || '',
            company_name: quickData.company_name || '',
            role: quickData.role || '',
            company_size: quickData.company_size || '',
            company_segment: quickData.company_segment || '',
            company_website: quickData.company_website || '',
            annual_revenue_range: quickData.annual_revenue_range || '',
            main_challenge: quickData.main_challenge || '',
            ai_knowledge_level: quickData.ai_knowledge_level || '',
            uses_ai: quickData.uses_ai || '',
            main_goal: quickData.main_goal || '',
            desired_ai_areas: quickData.desired_ai_areas || [],
            has_implemented: quickData.has_implemented || '',
            previous_tools: quickData.previous_tools || []
          });
          setHasExistingData(true);
        } else {
          console.log('ℹ️ Nenhum dado encontrado, iniciando com dados vazios');
          // Inicializar com dados básicos do usuário
          setData(prev => ({
            ...prev,
            email: user.email || '',
            name: user.user_metadata?.name || ''
          }));
        }
      } catch (error: any) {
        console.error('❌ Erro ao carregar dados:', error);
        setLoadError('Erro ao carregar seus dados. Você pode continuar mesmo assim.');
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user]);

  return {
    data,
    setData,
    isLoading,
    hasExistingData,
    loadError
  };
};
