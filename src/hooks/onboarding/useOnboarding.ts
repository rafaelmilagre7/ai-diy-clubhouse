import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

export interface OnboardingData {
  // Step 1: Informações Pessoais
  personal_info: {
    name: string;
    phone: string;
    state: string;
    city: string;
    birth_date?: string;
    profile_picture?: string;
  };
  
  // Step 2: Informações Profissionais
  professional_info: {
    company_name: string;
    company_sector: string;
    company_size: string;
    annual_revenue: string;
    current_position: string;
    main_challenge?: string;
  };
  
  // Step 3: Experiência com IA
  ai_experience: {
    experience_level: string;
    implementation_status: string;
    implementation_approach: string;
  };
  
  // Step 4: Objetivos
  goals_info: {
    primary_goal: string;
    timeline?: string;
    success_metrics?: string[];
    investment_capacity?: string;
    specific_objectives?: string;
    priority_areas?: string[];
  };
  
  // Step 5: Personalização
  personalization: {
    learning_style: string;
    communication_frequency?: string;
    preferred_content?: string[];
    support_level?: string;
    availability?: string;
    special_needs?: string;
  };
}

interface OnboardingState {
  id?: string;
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
  data: Partial<OnboardingData>;
  nina_message?: string;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    current_step: 1,
    completed_steps: [],
    is_completed: false,
    data: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Carregando...');

  // Backup localStorage para recuperação
  const saveToLocalStorage = useCallback((stepData: any, step: number) => {
    if (!user?.id) return;
    
    try {
      const stepMapping = {
        1: 'personal_info',
        2: 'professional_info', 
        3: 'ai_experience',
        4: 'goals_info',
        5: 'personalization',
      };
      
      const fieldName = stepMapping[step as keyof typeof stepMapping];
      const backup = {
        ...state.data,
        [fieldName]: stepData,
        lastSaved: new Date().toISOString(),
        currentStep: step
      };
      
      localStorage.setItem(`onboarding_backup_${user.id}`, JSON.stringify(backup));
      console.log('[BACKUP] Dados salvos no localStorage para step:', step);
    } catch (error) {
      console.warn('[BACKUP] Erro ao salvar no localStorage:', error);
    }
  }, [user?.id, state.data]);

  // Recuperar dados do localStorage
  const recoverFromLocalStorage = useCallback(() => {
    if (!user?.id) return null;
    
    try {
      const backup = localStorage.getItem(`onboarding_backup_${user.id}`);
      if (backup) {
        const parsedBackup = JSON.parse(backup);
        console.log('[BACKUP] Recuperando dados do localStorage:', parsedBackup);
        return parsedBackup;
      }
    } catch (error) {
      console.warn('[BACKUP] Erro ao recuperar localStorage:', error);
    }
    
    return null;
  }, [user?.id]);

  // Limpar backup após finalização com sucesso
  const clearLocalStorageBackup = useCallback(() => {
    if (!user?.id) return;
    
    try {
      localStorage.removeItem(`onboarding_backup_${user.id}`);
      console.log('[BACKUP] Backup removido do localStorage');
    } catch (error) {
      console.warn('[BACKUP] Erro ao limpar localStorage:', error);
    }
  }, [user?.id]);

  // Carregar dados existentes do onboarding
  const loadOnboardingData = useCallback(async () => {
    if (!user?.id) {
      console.log('[ONBOARDING] Usuário não encontrado');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('[ONBOARDING] Carregando dados para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Mudança aqui: usar maybeSingle() em vez de single()

      if (error) {
        console.error('[ONBOARDING] Erro ao carregar:', error);
        return;
      }
      
      console.log('[ONBOARDING] Dados encontrados:', data);

      if (data) {
        console.log('[ONBOARDING] Setando estado com dados carregados');
        
        // Determinar o próximo step baseado nos dados existentes
        let nextStep = 1;
        
        // Função para verificar se um objeto tem dados válidos
        const hasValidData = (obj: any) => {
          if (!obj || typeof obj !== 'object') return false;
          const keys = Object.keys(obj);
          return keys.length > 0 && keys.some(key => obj[key] && obj[key] !== '');
        };
        
        // Verificar qual é o próximo step incompleto
        if (hasValidData(data.personal_info)) {
          console.log('[ONBOARDING] Personal info válido, indo para step 2');
          nextStep = 2;
        }
        if (hasValidData(data.professional_info)) {
          console.log('[ONBOARDING] Professional info válido, indo para step 3');
          nextStep = 3;
        }
        if (hasValidData(data.ai_experience)) {
          console.log('[ONBOARDING] AI experience válido, indo para step 4');
          nextStep = 4;
        }
        if (hasValidData(data.goals_info)) {
          console.log('[ONBOARDING] Goals info válido, indo para step 5');
          nextStep = 5;
        }
        if (hasValidData(data.personalization)) {
          console.log('[ONBOARDING] Personalization válido, indo para step 6');
          nextStep = 6;
        }
        
        console.log('[ONBOARDING] Step calculado baseado nos dados:', nextStep);
        console.log('[ONBOARDING] Dados disponíveis:', {
          personal_info: Object.keys(data.personal_info || {}).length,
          professional_info: Object.keys(data.professional_info || {}).length,
          ai_experience: Object.keys(data.ai_experience || {}).length,
          goals_info: Object.keys(data.goals_info || {}).length,
          personalization: Object.keys(data.personalization || {}).length
        });
        
        setState({
          id: data.id,
          current_step: nextStep,
          completed_steps: data.completed_steps || [],
          is_completed: data.is_completed,
          nina_message: data.nina_message,
          data: {
            personal_info: data.personal_info || {},
            professional_info: data.professional_info || {},
            ai_experience: data.ai_experience || {},
            goals_info: data.goals_info || {},
            personalization: data.personalization || {},
          },
        });
      } else {
        console.log('[ONBOARDING] Nenhum dado encontrado - verificando backup localStorage');
        
        // Tentar recuperar dados do localStorage
        const backup = recoverFromLocalStorage();
        if (backup) {
          console.log('[ONBOARDING] Recuperando dados do backup localStorage');
          setState({
            id: null,
            current_step: backup.currentStep || 1,
            completed_steps: [],
            is_completed: false,
            nina_message: null,
            data: backup,
          });
          
          toast({
            title: 'Dados recuperados',
            description: 'Seus dados foram recuperados de onde você parou.',
            variant: 'default'
          });
        } else {
          console.log('[ONBOARDING] Primeiro acesso - sem backup');
          setState({
            id: null,
            current_step: 1,
            completed_steps: [],
            is_completed: false,
            nina_message: null,
            data: {},
          });
        }
      }
    } catch (error) {
      console.error('[ONBOARDING] Erro crítico ao carregar:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, recoverFromLocalStorage]);

  // Salvar dados do step atual
  const saveStepData = useCallback(async (step: number, stepData: any) => {
    if (!user?.id) {
      console.error('[ONBOARDING] Usuário não autenticado, não é possível salvar');
      return false;
    }
    
    console.log('[ONBOARDING] Iniciando salvamento do step:', step);
    console.log('[ONBOARDING] Dados a salvar:', stepData);
    console.log('[ONBOARDING] ID do usuário:', user.id);
    
    try {
      setIsSaving(true);
      
      // Mensagens dinâmicas baseadas no step
      const stepMessages = {
        1: 'Salvando suas informações pessoais...',
        2: 'Salvando dados da sua empresa...',
        3: 'Salvando sua experiência com IA...',
        4: 'Salvando seus objetivos...',
        5: 'Salvando preferências de aprendizado...'
      };
      
      setLoadingMessage(stepMessages[step as keyof typeof stepMessages] || 'Salvando dados...');
      const toastId = toast({ 
        title: stepMessages[step as keyof typeof stepMessages], 
        description: 'Por favor aguarde...' 
      }).id;
      
      // Salvar backup no localStorage antes de tentar salvar no servidor
      saveToLocalStorage(stepData, step);
      
      const stepMapping = {
        1: 'personal_info',
        2: 'professional_info', 
        3: 'ai_experience',
        4: 'goals_info',
        5: 'personalization',
      };
      
      const fieldName = stepMapping[step as keyof typeof stepMapping];
      const newCompletedSteps = [...state.completed_steps];
      if (!newCompletedSteps.includes(step)) {
        newCompletedSteps.push(step);
      }

      const updateData = {
        user_id: user.id,
        current_step: step,
        completed_steps: newCompletedSteps,
        [fieldName]: stepData,
      };

      console.log('[ONBOARDING] Dados preparados para salvamento:', updateData);
      
      if (state.id) {
        // Atualizar registro existente
        console.log('[ONBOARDING] Atualizando registro existente com ID:', state.id);
        const { error } = await supabase
          .from('onboarding_final')
          .update(updateData)
          .eq('id', state.id);

        if (error) {
          console.error('[ONBOARDING] Erro ao atualizar:', error);
          throw error;
        }
        console.log('[ONBOARDING] Registro atualizado com sucesso');
      } else {
        // Criar novo registro
        console.log('[ONBOARDING] Criando novo registro');
        const { data: newRecord, error } = await supabase
          .from('onboarding_final')
          .insert(updateData)
          .select()
          .single();

        if (error) {
          console.error('[ONBOARDING] Erro ao criar registro:', error);
          throw error;
        }
        
        console.log('[ONBOARDING] Novo registro criado:', newRecord);
        setState(prev => ({ ...prev, id: newRecord.id }));
      }

      // Atualizar estado local
      setState(prev => ({
        ...prev,
        current_step: step,
        completed_steps: newCompletedSteps,
        data: {
          ...prev.data,
          [fieldName]: stepData,
        },
      }));

      console.log('[ONBOARDING] Step', step, 'salvo com sucesso!');
      toast({ 
        title: 'Dados salvos!', 
        description: 'Seus dados foram salvos com sucesso.',
        variant: 'default'
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar step:', error);
      toast({ 
        title: 'Erro ao salvar', 
        description: 'Erro ao salvar dados: ' + (error?.message || 'Erro desconhecido'),
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, state.id, state.completed_steps, saveToLocalStorage]);

  // Navegar para próximo step
  const goToNextStep = useCallback(async (currentStepData?: any) => {
    if (currentStepData) {
      const success = await saveStepData(state.current_step, currentStepData);
      if (!success) return false;
    }

    if (state.current_step < 6) {
      setState(prev => ({ ...prev, current_step: prev.current_step + 1 }));
      return true;
    }
    
    return false;
  }, [state.current_step, saveStepData]);

  // Navegar para step anterior
  const goToPrevStep = useCallback(() => {
    if (state.current_step > 1) {
      setState(prev => ({ ...prev, current_step: prev.current_step - 1 }));
    }
  }, [state.current_step]);

  // Finalizar onboarding (gerar mensagem da NINA)
  const completeOnboarding = useCallback(async (finalStepData: any) => {
    if (!user?.id) return false;
    
    try {
      setIsSaving(true);
      setLoadingMessage('Finalizando sua configuração...');
      
      // Salvar dados do step 5 primeiro
      const success = await saveStepData(5, finalStepData);
      if (!success) {
        throw new Error('Falha ao salvar dados do step 5');
      }
      
      setLoadingMessage('Gerando sua experiência personalizada...');
      
      // Tentar gerar mensagem da NINA (com fallback)
      let ninaMessage = 'Bem-vindo(a) ao Viver de IA! Sua jornada personalizada está pronta para começar. Explore nossa plataforma e descubra como a IA pode transformar seu negócio!';
      
      try {
        console.log('[ONBOARDING] Tentando gerar mensagem da NINA...');
        const { data: ninaData, error: ninaError } = await supabase.functions
          .invoke('generate-nina-message', {
            body: {
              user_id: user.id,
              onboarding_data: {
                ...state.data,
                personalization: finalStepData,
              },
            },
          });

        if (ninaError) {
          console.warn('[ONBOARDING] Erro ao gerar mensagem da NINA, usando mensagem padrão:', ninaError);
        } else if (ninaData?.message) {
          ninaMessage = ninaData.message;
          console.log('[ONBOARDING] Mensagem da NINA gerada com sucesso');
        }
      } catch (ninaError) {
        console.warn('[ONBOARDING] Edge Function não disponível, usando mensagem padrão:', ninaError);
      }

      setLoadingMessage('Aplicando configurações finais...');
      
      // Finalizar onboarding
      console.log('[ONBOARDING] Finalizando onboarding via complete_onboarding_flow...');
      const { error } = await supabase.rpc('complete_onboarding_flow', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('[ONBOARDING] Erro na função complete_onboarding_flow:', error);
        throw error;
      }

      // Atualizar estado local
      setState(prev => ({
        ...prev,
        is_completed: true,
        completed_steps: [1, 2, 3, 4, 5], // NÃO incluir step 6 aqui para evitar "step 7 de 6"
        nina_message: ninaMessage,
      }));

      // Limpar backup após sucesso
      clearLocalStorageBackup();

      console.log('[ONBOARDING] Onboarding concluído com sucesso!');
      
      toast({ 
        title: 'Onboarding concluído!', 
        description: 'Bem-vindo à nossa plataforma! Redirecionando para o dashboard...',
        variant: 'default'
      });
      
      // Redirecionar após um breve delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
      return true;

    } catch (error) {
      console.error('[ONBOARDING] Erro ao finalizar onboarding:', error);
      toast({ 
        title: 'Erro ao finalizar', 
        description: 'Erro ao finalizar onboarding: ' + (error?.message || 'Erro desconhecido'),
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, state.data, saveStepData, clearLocalStorageBackup]);

  // Carregar dados na inicialização e verificar query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    
    loadOnboardingData().then(() => {
      // Só usar parâmetro URL se for para forçar um step específico E não há dados salvos
      if (stepParam && !state.id) {
        const targetStep = parseInt(stepParam);
        if (targetStep >= 1 && targetStep <= 6) {
          console.log('[ONBOARDING] Definindo step via URL param (sem dados salvos):', targetStep);
          setState(prev => ({ ...prev, current_step: targetStep }));
        }
      }
    });
  }, [loadOnboardingData]);

  return {
    // Estado
    ...state,
    isLoading,
    isSaving,
    loadingMessage,
    
    // Ações
    saveStepData,
    goToNextStep,
    goToPrevStep,
    completeOnboarding,
    setState, // Expor setState para permitir atualizações locais
    
    // Helpers
    isStepCompleted: (step: number) => state.completed_steps.includes(step),
    canGoToStep: (step: number) => step <= Math.max(...state.completed_steps, state.current_step),
    progressPercentage: Math.round((state.completed_steps.length / 6) * 100),
  };
};