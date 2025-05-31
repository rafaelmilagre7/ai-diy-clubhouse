
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useQuickOnboarding } from './useQuickOnboarding';
import { useRealtimeValidation } from './useRealtimeValidation';
import { useIntelligentAutoSave } from './useIntelligentAutoSave';
import { mapQuickToProgress } from '@/utils/onboarding/dataMappers';
import { toast } from 'sonner';

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const { data: savedData, loadData, completeOnboarding: completeQuick } = useQuickOnboarding();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);

  // Dados do formulário com valores padrão seguros
  const [formData, setFormData] = useState<QuickOnboardingData>({
    name: '',
    email: '',
    whatsapp: '',
    country_code: '+55',
    birth_date: '',
    country: '',
    state: '',
    city: '',
    instagram_url: '',
    linkedin_url: '',
    how_found_us: '',
    referred_by: '',
    company_name: '',
    role: '',
    company_size: '',
    company_segment: '',
    company_website: '',
    annual_revenue_range: '',
    current_position: '',
    business_model: '',
    business_challenges: [],
    short_term_goals: [],
    medium_term_goals: [],
    important_kpis: [],
    additional_context: '',
    primary_goal: '',
    expected_outcomes: [],
    expected_outcome_30days: '',
    priority_solution_type: '',
    how_implement: '',
    week_availability: '',
    content_formats: [],
    ai_knowledge_level: 'iniciante',
    previous_tools: [],
    has_implemented: '',
    desired_ai_areas: [],
    completed_formation: false,
    is_member_for_month: false,
    nps_score: 0,
    improvement_suggestions: '',
    interests: [],
    time_preference: [],
    available_days: [],
    networking_availability: 5,
    skills_to_share: [],
    mentorship_topics: [],
    live_interest: 0,
    authorize_case_usage: false,
    interested_in_interview: false,
    priority_topics: [],
    currentStep: 1
  });

  // Validação em tempo real
  const validation = useRealtimeValidation(formData, currentStep);
  
  // Auto-save inteligente com debounce maior
  const { isSaving, saveImmediately } = useIntelligentAutoSave(
    formData, 
    currentStep,
    { 
      debounceMs: 4000, // 4 segundos para dar tempo ao usuário
      maxRetries: 1,
      enableLocalBackup: true 
    }
  );

  const totalSteps = 8;

  // Carregar dados salvos na inicialização
  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, loadData]);

  // Aplicar dados carregados
  useEffect(() => {
    if (savedData) {
      console.log('📥 Aplicando dados salvos:', savedData);
      setFormData(savedData);
      setCurrentStep(savedData.currentStep as number || 1);
    }
  }, [savedData]);

  // Atualizar campo individual
  const updateField = useCallback((field: keyof QuickOnboardingData, value: string | string[] | number | boolean) => {
    console.log('📝 Atualizando campo:', field, '=', value);
    
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      console.log('📊 Estado atualizado:', updated);
      return updated;
    });
  }, []);

  // Validar se pode prosseguir na etapa atual
  const canProceed = validation.canProceed;

  // Avançar para próxima etapa
  const nextStep = useCallback(async () => {
    if (!canProceed) {
      console.log('⚠️ Não pode prosseguir - validação falhou');
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      console.log('➡️ Avançando para próxima etapa...');
      
      // Salvar dados imediatamente antes de avançar
      const saveSuccess = await saveImmediately();
      
      if (!saveSuccess) {
        console.warn('⚠️ Falha ao salvar, mas continuando...');
        // Não bloquear o avanço por falha de save
      }

      if (currentStep < totalSteps) {
        const nextStepNumber = currentStep + 1;
        setCurrentStep(nextStepNumber);
        
        // Atualizar currentStep nos dados também
        setFormData(prev => ({ ...prev, currentStep: nextStepNumber }));
        
        console.log('✅ Avançou para etapa:', nextStepNumber);
        toast.success(`Etapa ${currentStep} concluída!`);
      }
    } catch (error) {
      console.error('❌ Erro ao avançar etapa:', error);
      toast.error('Erro ao avançar. Tente novamente.');
    }
  }, [canProceed, currentStep, totalSteps, saveImmediately]);

  // Voltar para etapa anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      const prevStepNumber = currentStep - 1;
      setCurrentStep(prevStepNumber);
      setFormData(prev => ({ ...prev, currentStep: prevStepNumber }));
      console.log('⬅️ Voltou para etapa:', prevStepNumber);
    }
  }, [currentStep]);

  // Completar onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!canProceed) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return false;
    }

    try {
      setIsCompleting(true);
      console.log('🏁 Completando onboarding final...');

      // Validar dados críticos antes de completar
      if (!formData.name || !formData.email || !formData.company_name) {
        throw new Error('Dados críticos faltando');
      }

      const success = await completeQuick(formData);
      
      if (success) {
        console.log('✅ Onboarding completado com sucesso!');
        return true;
      } else {
        throw new Error('Falha na conclusão');
      }
    } catch (error) {
      console.error('❌ Erro ao completar onboarding:', error);
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [canProceed, formData, completeQuick]);

  return {
    data: formData,
    currentStep,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed,
    totalSteps,
    isSaving,
    isCompleting,
    isLoading: false,
    // Estatísticas da validação para debug
    validation: {
      requiredFields: validation.currentStepValidation.requiredFieldsCount,
      completedFields: validation.currentStepValidation.completedFieldsCount,
      missingFields: validation.currentStepValidation.missingFields
    }
  };
};
