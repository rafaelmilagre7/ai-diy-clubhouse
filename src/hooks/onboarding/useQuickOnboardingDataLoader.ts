
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
  main_goal: ''
};

export const useQuickOnboardingDataLoader = () => {
  const [data, setData] = useState<QuickOnboardingData>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadSavedData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setLoadError(null);
      console.log('Carregando dados salvos para usuário:', user.id);

      // Primeiro, tentar carregar do quick_onboarding
      const { data: quickData, error: quickError } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (quickData && !quickError) {
        console.log('Dados encontrados no quick_onboarding:', quickData);
        
        const loadedData: QuickOnboardingData = {
          // Etapa 1
          name: quickData.name || '',
          email: quickData.email || '',
          whatsapp: quickData.whatsapp || '',
          country_code: quickData.country_code || '+55',
          birth_date: quickData.birth_date || '',
          instagram_url: quickData.instagram_url || '',
          linkedin_url: quickData.linkedin_url || '',
          how_found_us: quickData.how_found_us || '',
          referred_by: quickData.referred_by || '',

          // Etapa 2
          company_name: quickData.company_name || '',
          role: quickData.role || '',
          company_size: quickData.company_size || '',
          company_segment: quickData.company_segment || '',
          company_website: quickData.company_website || '',
          annual_revenue_range: quickData.annual_revenue_range || '',
          main_challenge: quickData.main_challenge || '',

          // Etapa 3
          ai_knowledge_level: quickData.ai_knowledge_level || '',
          uses_ai: quickData.uses_ai || '',
          main_goal: quickData.main_goal || ''
        };

        setData(loadedData);
        setHasExistingData(true);
        console.log('Dados carregados com sucesso:', loadedData);
        setIsLoading(false);
        return;
      }

      // Se não encontrou no quick_onboarding, tentar no onboarding_progress
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressData && !progressError) {
        console.log('Dados encontrados no onboarding_progress:', progressData);
        
        // Extrair dados dos campos JSONB
        const personalInfo = progressData.personal_info || {};
        const professionalInfo = progressData.professional_info || {};
        const aiExperience = progressData.ai_experience || {};

        const loadedData: QuickOnboardingData = {
          // Etapa 1 - do personal_info
          name: personalInfo.name || '',
          email: personalInfo.email || '',
          whatsapp: personalInfo.phone || '',
          country_code: personalInfo.ddi || '+55',
          birth_date: '',
          instagram_url: personalInfo.instagram || '',
          linkedin_url: personalInfo.linkedin || '',
          how_found_us: progressData.how_found_us || '',
          referred_by: progressData.referred_by || '',

          // Etapa 2 - do professional_info
          company_name: professionalInfo.company_name || progressData.company_name || '',
          role: professionalInfo.current_position || '',
          company_size: professionalInfo.company_size || progressData.company_size || '',
          company_segment: professionalInfo.company_sector || progressData.company_sector || '',
          company_website: professionalInfo.company_website || progressData.company_website || '',
          annual_revenue_range: professionalInfo.annual_revenue || progressData.annual_revenue || '',
          main_challenge: '',

          // Etapa 3 - do ai_experience
          ai_knowledge_level: aiExperience.knowledge_level || '',
          uses_ai: aiExperience.has_implemented || '',
          main_goal: ''
        };

        setData(loadedData);
        setHasExistingData(true);
        console.log('Dados migrados do onboarding_progress:', loadedData);
      } else {
        console.log('Nenhum dado existente encontrado, usando dados iniciais');
        setData(initialData);
        setHasExistingData(false);
      }

    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
      setLoadError('Não foi possível carregar os dados salvos');
      setData(initialData);
      setHasExistingData(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedData();
  }, [user?.id]);

  return {
    data,
    setData,
    isLoading,
    hasExistingData,
    loadError,
    reloadData: loadSavedData
  };
};
