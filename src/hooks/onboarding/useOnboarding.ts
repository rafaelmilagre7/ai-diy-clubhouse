import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToastModern } from '@/hooks/useToastModern';
import { useProfileSync } from '@/hooks/auth/useProfileSync';
import { useNavigate } from 'react-router-dom';

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

export type UserType = 'entrepreneur' | 'learner';

interface OnboardingState {
  id?: string;
  userType?: UserType;
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
  data: Partial<OnboardingData>;
  nina_message?: string;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const { syncProfile, markProfileStale } = useProfileSync();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToastModern();
  const [state, setState] = useState<OnboardingState>({
    userType: undefined,
    current_step: 0, // Começar no Step 0 para escolher tipo
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
        
        // LÓGICA ROBUSTA DE REDIRECIONAMENTO
        let nextStep;
        const completedSteps = data.completed_steps || [];
        
        // PRIORIDADE 1: Se onboarding já está marcado como completo
        if (data.is_completed === true) {
          console.log('[ONBOARDING] ✅ ONBOARDING COMPLETO - redirecionando para dashboard');
          // Se já está completo, redirecionar para dashboard em vez de mostrar step 6
          window.location.href = '/dashboard';
          return;
        }
        
        // PRIORIDADE 2: Se não tem user_type, começar do zero
        if (!data.user_type) {
          console.log('[ONBOARDING] user_type é NULL - redirecionando para step 0');
          nextStep = 0;
        } 
        // PRIORIDADE 3: Se tem step 6 nos completed_steps, ir direto para celebração
        else if (completedSteps.includes(6)) {
          console.log('[ONBOARDING] 🎯 STEP 6 JÁ COMPLETADO - indo para celebração final');
          nextStep = 6;
        }
        // PRIORIDADE 4: Se completou todos os 5 steps iniciais, ir para step 6
        else if ([1,2,3,4,5].every(step => completedSteps.includes(step))) {
          console.log('[ONBOARDING] 🎯 TODOS OS 5 STEPS COMPLETADOS - indo para Step 6 (finalização)');
          nextStep = 6;
        } 
        // PRIORIDADE 5: Determinar próximo step baseado no progresso
        else {
          // Função para verificar se um objeto tem dados válidos
          const hasValidData = (obj: any) => {
            if (!obj || typeof obj !== 'object') return false;
            const keys = Object.keys(obj);
            return keys.length > 0 && keys.some(key => obj[key] && obj[key] !== '');
          };
          
          // Começar do step 1 e avançar baseado nos dados
          nextStep = 1;
          
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
          userType: data.user_type as UserType || undefined, // Manter undefined se NULL
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
          
          showSuccess('Dados recuperados', 'Seus dados foram recuperados de onde você parou.');
        } else {
          console.log('[ONBOARDING] Primeiro acesso - sem backup');
          setState({
            id: null,
            userType: undefined,
            current_step: 0, // Começar no Step 0 para novos usuários
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
    
    // Validação adicional dos dados antes de salvar
    if (!stepData || Object.keys(stepData).length === 0) {
      console.error('[ONBOARDING] Dados vazios ou inválidos para salvamento:', stepData);
      return false;
    }
    
    console.log('[ONBOARDING] Iniciando salvamento do step:', step);
    console.log('[ONBOARDING] Dados a salvar (detalhados):', JSON.stringify(stepData, null, 2));
    console.log('[ONBOARDING] ID do usuário:', user.id);
    console.log('[ONBOARDING] Estado atual:', { 
      stateId: state.id, 
      currentStep: state.current_step, 
      completedSteps: state.completed_steps 
    });
    
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
      showInfo(
        stepMessages[step as keyof typeof stepMessages] || 'Salvando dados...', 
        'Por favor aguarde...'
      );
      
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
        current_step: step === 5 && state.current_step === 6 ? 6 : step, // Não voltar ao step 5 se já estamos no 6
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
        current_step: step === 5 && prev.current_step === 6 ? 6 : step, // Não voltar ao step 5 se já estamos no 6
        completed_steps: newCompletedSteps,
        data: {
          ...prev.data,
          [fieldName]: stepData,
        },
      }));

      console.log('[ONBOARDING] Step', step, 'salvo com sucesso!');
      showSuccess('Dados salvos!', 'Seus dados foram salvos com sucesso.');
      return true;
    } catch (error) {
      console.error('Erro ao salvar step:', error);
      showError('Erro ao salvar', 'Erro ao salvar dados: ' + (error?.message || 'Erro desconhecido'));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, state.id, state.completed_steps, saveToLocalStorage]);

  // Navegar para próximo step
  const goToNextStep = useCallback(async (currentStepData?: any) => {
    console.log('[ONBOARDING] 🚶 goToNextStep chamado', {
      current_step: state.current_step,
      hasStepData: !!currentStepData
    });
    
    if (currentStepData) {
      const success = await saveStepData(state.current_step, currentStepData);
      if (!success) {
        console.error('[ONBOARDING] ❌ Falha ao salvar em goToNextStep');
        return false;
      }
    }

    if (state.current_step < 6) {
      const nextStep = state.current_step + 1;
      console.log('[ONBOARDING] ➡️ Avançando de', state.current_step, 'para', nextStep);
      setState(prev => ({ ...prev, current_step: nextStep }));
      return true;
    }
    
    console.log('[ONBOARDING] ⚠️ Já estamos no step 6, não avançar');
    return false;
  }, [state.current_step, saveStepData]);

  // Navegar para step anterior
  const goToPrevStep = useCallback(() => {
    if (state.current_step > 1) {
      setState(prev => ({ ...prev, current_step: prev.current_step - 1 }));
    }
  }, [state.current_step]);

  // Salvar tipo de usuário (Step 0)
  const saveUserType = useCallback(async (userType: UserType) => {
    if (!user?.id) {
      console.error('[ONBOARDING] Usuário não autenticado');
      return false;
    }

    try {
      console.log('[ONBOARDING] Salvando user_type:', userType);
      
      const updateData = {
        user_id: user.id,
        current_step: 1, // Avançar para step 1 após salvar tipo
        user_type: userType,
        completed_steps: [0], // Marcar step 0 como concluído
      };

      let recordId = state.id;

      if (state.id) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('onboarding_final')
          .update(updateData)
          .eq('id', state.id);

        if (error) {
          console.error('[ONBOARDING] Erro ao atualizar user_type:', error);
          throw error;
        }
      } else {
        // Criar novo registro
        const { data: newRecord, error } = await supabase
          .from('onboarding_final')
          .insert(updateData)
          .select()
          .single();

        if (error) {
          console.error('[ONBOARDING] Erro ao criar registro:', error);
          throw error;
        }
        
        recordId = newRecord.id;
      }

      // Atualizar estado local
      setState(prev => ({
        ...prev,
        id: recordId,
        userType,
        current_step: 1,
        completed_steps: [0],
      }));

      console.log('[ONBOARDING] UserType salvo com sucesso:', userType);
      return true;
    } catch (error) {
      console.error('[ONBOARDING] Erro ao salvar user_type:', error);
      return false;
    }
  }, [user?.id, state.id]);

  // Finalizar onboarding (gerar mensagem da NINA)
  const completeOnboarding = useCallback(async (finalStepData: any) => {
    if (!user?.id) {
      console.error('[ONBOARDING] ❌ Sem user.id');
      return false;
    }
    
    console.log('[ONBOARDING] 🎬 === INICIANDO COMPLETE ONBOARDING ===');
    console.log('[ONBOARDING] 📊 Estado atual:', {
      current_step: state.current_step,
      is_completed: state.is_completed,
      completed_steps: state.completed_steps,
      has_id: !!state.id
    });
    
    try {
      const startTime = performance.now();
      
      setIsSaving(true);
      setLoadingMessage('Finalizando sua configuração...');
      
      // NÃO salvar step 5 se já estamos no step 6
      if (state.current_step < 6) {
        console.log('[ONBOARDING] 💾 Salvando step 5 primeiro...');
        const stepStartTime = performance.now();
        const success = await saveStepData(5, finalStepData);
        console.log('[ONBOARDING] ⏱️ Step 5 salvo em:', performance.now() - stepStartTime, 'ms');
        
        if (!success) {
          console.error('[ONBOARDING] ❌ Falha ao salvar step 5');
          throw new Error('Falha ao salvar dados do step 5');
        }
      } else {
        console.log('[ONBOARDING] ⏭️ current_step >= 6, pulando salvamento do step 5');
      }
      
      setLoadingMessage('Gerando sua experiência personalizada...');
      
      // Mensagem personalizada direta (removendo chamada para edge function inexistente)
      const userName = state.data.personal_info?.name || 'usuário';
      const companyName = state.data.professional_info?.company_name || 'sua empresa';
      const primaryGoal = state.data.goals_info?.primary_goal || 'transformar seu negócio';
      
      const ninaMessage = `Olá ${userName}! 🎉 Que alegria ter você conosco no Viver de IA!

Estou muito animada para acompanhar sua jornada de transformação digital na ${companyName}. Com base no que você compartilhou, vejo um grande potencial para ${primaryGoal} usando inteligência artificial.

Preparei uma experiência completamente personalizada para você, com conteúdos e ferramentas que fazem sentido para seu contexto e objetivos. 

Vamos começar? Sua trilha personalizada já está pronta! 🚀`;

      setLoadingMessage('Aplicando configurações finais...');
      
      // Finalizar onboarding com função RPC
      console.log('[ONBOARDING] 🎯 Chamando RPC complete_onboarding_final_flow...');
      console.log('[ONBOARDING] 📤 Parâmetros:', { p_user_id: user.id });
      const rpcStartTime = performance.now();
      
      const { data: rpcResult, error: rpcError } = await supabase.rpc('complete_onboarding_final_flow', {
        p_user_id: user.id,
      });
      
      const rpcDuration = performance.now() - rpcStartTime;
      console.log('[ONBOARDING] ⏱️ RPC finalizado em:', rpcDuration, 'ms');
      console.log('[ONBOARDING] 📥 Resposta RPC:', rpcResult);

      if (rpcError) {
        console.error('[ONBOARDING] ❌ Erro na RPC complete_onboarding_final_flow:', rpcError);
        throw rpcError;
      }
      
      if (rpcResult && !rpcResult.success) {
        console.error('[ONBOARDING] ❌ RPC retornou sucesso=false:', rpcResult);
        throw new Error(rpcResult.error || 'Erro desconhecido ao finalizar onboarding');
      }
      
      console.log('[ONBOARDING] ✅ RPC executada com sucesso');

      // Invalidar AMBOS os caches antes de sincronizar
      console.log('[ONBOARDING] ⏱️ Invalidando caches...');
      markProfileStale(); // Invalida authSessionUtils cache

      // NOVO: Invalidar também o AuthCache (localStorage)
      try {
        const { authCache } = await import('@/lib/auth/authCache');
        authCache.remove(user.id);
        console.log('[ONBOARDING] ✅ AuthCache (localStorage) invalidado');
      } catch (cacheError) {
        console.warn('[ONBOARDING] ⚠️ Erro ao invalidar authCache:', cacheError);
      }

      // SINCRONIZAÇÃO BLOCANTE com retry
      console.log('[ONBOARDING] ⏱️ Iniciando sincronização blocante do perfil...');
      let syncAttempts = 0;
      const maxRetries = 3;
      let syncSuccess = false;

      while (syncAttempts < maxRetries && !syncSuccess) {
        try {
          syncAttempts++;
          console.log(`[ONBOARDING] 🔄 Tentativa ${syncAttempts}/${maxRetries} de sincronização`);
          
          await syncProfile(false);
          syncSuccess = true;
          console.log('[ONBOARDING] ✅ Perfil sincronizado com sucesso!');
        } catch (syncError) {
          console.warn(`[ONBOARDING] ⚠️ Tentativa ${syncAttempts} falhou:`, syncError);
          
          if (syncAttempts < maxRetries) {
            // Aguardar 500ms antes de tentar novamente
            console.log('[ONBOARDING] ⏳ Aguardando 500ms antes de retry...');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Re-invalidar cache antes de tentar novamente
            markProfileStale();
            try {
              const { authCache } = await import('@/lib/auth/authCache');
              authCache.remove(user.id);
            } catch {}
          }
        }
      }

      // Se falhou todas as tentativas, invalidar TUDO como última tentativa
      if (!syncSuccess) {
        console.error('[ONBOARDING] ❌ CRÍTICO: Todas as tentativas de sincronização falharam');
        
        // Última tentativa: limpar TODOS os caches
        try {
          const { clearProfileCache } = await import('@/hooks/auth/utils/authSessionUtils');
          clearProfileCache(user.id);
          
          const { authCache } = await import('@/lib/auth/authCache');
          authCache.clear(); // Limpar TUDO do authCache
          
          console.log('[ONBOARDING] 🗑️ Todos os caches limpos como fallback');
        } catch (cleanupError) {
          console.error('[ONBOARDING] ❌ Erro ao limpar caches:', cleanupError);
        }
        
        // Continuar mesmo assim para não bloquear o usuário permanentemente
        console.warn('[ONBOARDING] ⚠️ Continuando apesar da falha de sincronização');
      }

      // Aguardar propagação (800ms) para garantir que o banco atualizou o cache
      console.log('[ONBOARDING] ⏳ Aguardando 800ms para propagação...');
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('[ONBOARDING] ✅ Sincronização concluída');

      // Atualizar estado local rapidamente
      console.log('[ONBOARDING] ⏱️ Atualizando estado local...');
      const stateStartTime = performance.now();
      
      setState(prev => ({
        ...prev,
        is_completed: true,
        completed_steps: [1, 2, 3, 4, 5, 6], // Incluir step 6
        nina_message: ninaMessage,
      }));
      
      console.log('[ONBOARDING] ⏱️ Estado atualizado em:', performance.now() - stateStartTime, 'ms');

      // Limpar backup após sucesso
      clearLocalStorageBackup();

      const totalTime = performance.now() - startTime;
      console.log('[ONBOARDING] ⏱️ Tempo total de execução:', totalTime, 'ms');
      console.log('[ONBOARDING] Onboarding concluído com sucesso!');
      
      // Aguardar tempo para celebração completa
      console.log('[ONBOARDING] ⏱️ Onboarding finalizado - celebração será gerenciada pelo componente');
      // Não redirecionar automaticamente aqui - deixar que o OnboardingSuccess gerencie
      
      return true;

    } catch (error) {
      console.error('[ONBOARDING] Erro ao finalizar onboarding:', error);
      showError('Erro ao finalizar', 'Erro ao finalizar onboarding: ' + (error?.message || 'Erro desconhecido'));
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
    saveUserType,
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