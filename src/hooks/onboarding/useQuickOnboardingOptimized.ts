
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { toast } from 'sonner';

const initialData: QuickOnboardingData = {
  // Etapa 1: Informações Pessoais Básicas
  name: '',
  email: '',
  whatsapp: '',
  country_code: '+55',
  birth_date: '',
  
  // Etapa 2: Localização e Redes Sociais
  country: '',
  state: '',
  city: '',
  timezone: '',
  instagram_url: '',
  linkedin_url: '',
  
  // Etapa 3: Como nos conheceu
  how_found_us: '',
  referred_by: '',
  
  // Etapa 4: Informações Profissionais
  company_name: '',
  role: '',
  company_size: '',
  company_segment: '',
  company_website: '',
  annual_revenue_range: '',
  current_position: '',
  
  // Etapa 5: Contexto do Negócio
  business_model: '',
  main_challenge: '',
  business_challenges: [],
  short_term_goals: [],
  medium_term_goals: [],
  important_kpis: [],
  additional_context: '',
  
  // Etapa 6: Objetivos e Metas
  main_goal: '',
  primary_goal: '',
  expected_outcomes: [],
  expected_outcome_30days: '',
  priority_solution_type: '',
  how_implement: '',
  week_availability: '',
  content_formats: [],
  
  // Etapa 7: Experiência com IA
  ai_knowledge_level: '',
  uses_ai: '',
  previous_tools: [],
  has_implemented: '',
  desired_ai_areas: [],
  completed_formation: false,
  is_member_for_month: false,
  nps_score: 0,
  improvement_suggestions: '',
  
  // Etapa 8: Personalização da Experiência
  interests: [],
  time_preference: [],
  available_days: [],
  networking_availability: 0,
  skills_to_share: [],
  mentorship_topics: [],
  
  // Campos de controle
  live_interest: 0,
  authorize_case_usage: false,
  interested_in_interview: false,
  priority_topics: []
};

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [data, setData] = useState<QuickOnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Load existing data or create initial record
  useEffect(() => {
    const loadOrCreateOnboarding = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        setLoadError(null);
        
        // Try to fetch existing data
        const { data: existingData, error } = await supabase
          .from('quick_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching onboarding data:', error);
          setLoadError('Erro ao carregar dados do onboarding');
          return;
        }

        if (existingData) {
          // Load existing data with all fields
          setHasExistingData(true);
          setData({
            // Etapa 1: Informações Pessoais Básicas
            name: existingData.name || '',
            email: existingData.email || '',
            whatsapp: existingData.whatsapp || '',
            country_code: existingData.country_code || '+55',
            birth_date: existingData.birth_date || '',
            
            // Etapa 2: Localização e Redes Sociais
            country: existingData.country || '',
            state: existingData.state || '',
            city: existingData.city || '',
            timezone: existingData.timezone || '',
            instagram_url: existingData.instagram_url || '',
            linkedin_url: existingData.linkedin_url || '',
            
            // Etapa 3: Como nos conheceu
            how_found_us: existingData.how_found_us || '',
            referred_by: existingData.referred_by || '',
            
            // Etapa 4: Informações Profissionais
            company_name: existingData.company_name || '',
            role: existingData.role || '',
            company_size: existingData.company_size || '',
            company_segment: existingData.company_segment || '',
            company_website: existingData.company_website || '',
            annual_revenue_range: existingData.annual_revenue_range || '',
            current_position: existingData.current_position || '',
            
            // Etapa 5: Contexto do Negócio
            business_model: existingData.business_model || '',
            main_challenge: existingData.main_challenge || '',
            business_challenges: existingData.business_challenges || [],
            short_term_goals: existingData.short_term_goals || [],
            medium_term_goals: existingData.medium_term_goals || [],
            important_kpis: existingData.important_kpis || [],
            additional_context: existingData.additional_context || '',
            
            // Etapa 6: Objetivos e Metas
            main_goal: existingData.main_goal || '',
            primary_goal: existingData.primary_goal || '',
            expected_outcomes: existingData.expected_outcomes || [],
            expected_outcome_30days: existingData.expected_outcome_30days || '',
            priority_solution_type: existingData.priority_solution_type || '',
            how_implement: existingData.how_implement || '',
            week_availability: existingData.week_availability || '',
            content_formats: existingData.content_formats || [],
            
            // Etapa 7: Experiência com IA
            ai_knowledge_level: existingData.ai_knowledge_level || '',
            uses_ai: existingData.uses_ai || '',
            previous_tools: existingData.previous_tools || [],
            has_implemented: existingData.has_implemented || '',
            desired_ai_areas: existingData.desired_ai_areas || [],
            completed_formation: existingData.completed_formation || false,
            is_member_for_month: existingData.is_member_for_month || false,
            nps_score: existingData.nps_score || 0,
            improvement_suggestions: existingData.improvement_suggestions || '',
            
            // Etapa 8: Personalização da Experiência
            interests: existingData.interests || [],
            time_preference: existingData.time_preference || [],
            available_days: existingData.available_days || [],
            networking_availability: existingData.networking_availability || 0,
            skills_to_share: existingData.skills_to_share || [],
            mentorship_topics: existingData.mentorship_topics || [],
            
            // Campos de controle
            live_interest: existingData.live_interest || 0,
            authorize_case_usage: existingData.authorize_case_usage || false,
            interested_in_interview: existingData.interested_in_interview || false,
            priority_topics: existingData.priority_topics || []
          });
          setCurrentStep(existingData.current_step || 1);
        } else {
          // Create initial record
          setHasExistingData(false);
          const { error: insertError } = await supabase
            .from('quick_onboarding')
            .insert({
              user_id: user.id,
              email: user.email || '',
              current_step: 1,
              is_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error creating initial onboarding record:', insertError);
            setLoadError('Erro ao inicializar onboarding');
          } else {
            // Update data with user info
            setData(prev => ({
              ...prev,
              email: user.email || '',
              name: user.user_metadata?.name || ''
            }));
          }
        }
      } catch (error) {
        console.error('Unexpected error in loadOrCreateOnboarding:', error);
        setLoadError('Erro inesperado ao carregar onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrCreateOnboarding();
  }, [user]);

  // Auto-save functionality
  const saveData = async (updatedData: QuickOnboardingData, step: number) => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          ...updatedData,
          current_step: step,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving onboarding data:', error);
        toast.error('Erro ao salvar dados');
        return false;
      }

      setLastSaveTime(new Date());
      return true;
    } catch (error) {
      console.error('Unexpected error saving data:', error);
      toast.error('Erro inesperado ao salvar');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof QuickOnboardingData, value: string | string[] | number | boolean) => {
    const updatedData = { ...data, [field]: value };
    setData(updatedData);
    
    // Auto-save with debounce
    setTimeout(() => {
      saveData(updatedData, currentStep);
    }, 1000);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(data.name && data.email && data.whatsapp);
      case 2:
        return !!(data.country && data.state && data.city);
      case 3:
        return !!(data.how_found_us);
      case 4:
        return !!(data.company_name && data.role && data.company_size && data.company_segment);
      case 7:
        return !!(data.ai_knowledge_level && data.uses_ai);
      default:
        return true;
    }
  };

  const nextStep = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const newStep = currentStep + 1;
    setCurrentStep(newStep);
    await saveData(data, newStep);
  };

  const previousStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      saveData(data, newStep);
    }
  };

  const completeOnboarding = async () => {
    if (!user?.id) return false;

    try {
      setIsCompleting(true);
      
      const { error } = await supabase
        .from('quick_onboarding')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error completing onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      toast.success('Onboarding concluído com sucesso! 🎉');
      return true;
    } catch (error) {
      console.error('Unexpected error completing onboarding:', error);
      toast.error('Erro inesperado ao finalizar');
      return false;
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    data,
    currentStep,
    isLoading,
    isSaving,
    isCompleting,
    hasExistingData,
    loadError,
    lastSaveTime,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed: validateStep(currentStep),
    totalSteps: 8
  };
};
