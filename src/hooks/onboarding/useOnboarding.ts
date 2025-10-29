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
          // Se já está completo, redirecionar para dashboard usando React Router (não reload)
          navigate('/dashboard', { replace: true });
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

      console.log('[ONBOARDING] 📧 Nina message gerada:', ninaMessage.substring(0, 50) + '...');
      setLoadingMessage('Aplicando configurações finais...');
      
      // ESTRATÉGIA SIMPLIFICADA E ROBUSTA
      console.log('[ONBOARDING] 🎯 Finalizando (estratégia robusta)...');
      const finalizationStartTime = performance.now();
      
      let profileSuccess = false;
      
      try {
        // CRÍTICO: Atualizar profiles PRIMEIRO (mais importante)
        console.log('[ONBOARDING] 📝 Atualizando profiles (PRIORIDADE 1)...');
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (profileError) {
          console.error('[ONBOARDING] ❌ Erro profiles:', profileError);
          
          // Fallback: tentar upsert
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              onboarding_completed: true,
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
          
          if (upsertError) throw new Error('Falha crítica em profiles');
        }
        
        profileSuccess = true;
        console.log('[ONBOARDING] ✅ profiles OK');
        
      } catch (profileError: any) {
        console.error('[ONBOARDING] ❌ CRÍTICO profiles:', profileError);
        showError("Erro ao finalizar", "Tente novamente.");
        throw profileError;
      }
      
      // Atualizar onboarding_final (secundário, não-bloqueante)
      try {
        console.log('[ONBOARDING] 📝 Atualizando onboarding_final...');
        
        const { data: existing } = await supabase
          .from('onboarding_final')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (existing) {
          console.log('[ONBOARDING] 📝 Updating existing onboarding_final...');
          const { error: updateError } = await supabase
            .from('onboarding_final')
            .update({
              is_completed: true,
              completed_at: new Date().toISOString(),
              current_step: 6,
              completed_steps: [0, 1, 2, 3, 4, 5, 6],
              nina_message: ninaMessage,
              user_type: state.userType,
              personal_info: state.data.personal_info || {},
              professional_info: state.data.professional_info || {},
              ai_experience: state.data.ai_experience || {},
              goals_info: state.data.goals_info || {},
              personalization: state.data.personalization || {},
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
          
          if (updateError) {
            console.error('[ONBOARDING] ❌ Erro no UPDATE:', updateError);
          } else {
            console.log('[ONBOARDING] ✅ onboarding_final UPDATED com nina_message');
          }
        } else {
          console.log('[ONBOARDING] 📝 Inserting new onboarding_final...');
          const { error: insertError } = await supabase
            .from('onboarding_final')
            .insert({
              user_id: user.id,
              is_completed: true,
              completed_at: new Date().toISOString(),
              current_step: 6,
              completed_steps: [0, 1, 2, 3, 4, 5, 6],
              nina_message: ninaMessage,
              user_type: state.userType,
              personal_info: state.data.personal_info || {},
              professional_info: state.data.professional_info || {},
              ai_experience: state.data.ai_experience || {},
              goals_info: state.data.goals_info || {},
              personalization: state.data.personalization || {},
              location_info: {
                state: state.data.personal_info?.state,
                city: state.data.personal_info?.city
              },
              business_info: {
                company_name: state.data.professional_info?.company_name,
                company_sector: state.data.professional_info?.company_sector
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('[ONBOARDING] ❌ Erro no INSERT:', insertError);
          } else {
            console.log('[ONBOARDING] ✅ onboarding_final INSERTED com nina_message');
          }
        }
      } catch (onboardingError) {
        console.warn('[ONBOARDING] ⚠️ Erro onboarding_final (não-bloqueante):', onboardingError);
      }
      
      console.log('[ONBOARDING] ⏱️ Finalização:', performance.now() - finalizationStartTime, 'ms');

      // Invalidar caches de forma simples e rápida
      console.log('[ONBOARDING] ⏱️ Invalidando caches...');
      markProfileStale();
      
      try {
        const { authCache } = await import('@/lib/auth/authCache');
        authCache.remove(user.id);
        console.log('[ONBOARDING] ✅ AuthCache invalidado');
      } catch {}
      
      // Sincronizar perfil de forma não-bloqueante
      console.log('[ONBOARDING] ⏱️ Sincronizando perfil...');
      try {
        await syncProfile(false);
        console.log('[ONBOARDING] ✅ Perfil sincronizado');
      } catch (syncError) {
        console.warn('[ONBOARDING] ⚠️ Erro na sincronização (não-bloqueante):', syncError);
      }
      
      // Pequena pausa para propagação (reduzido de 800ms para 300ms)
      await new Promise(resolve => setTimeout(resolve, 300));

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

    } catch (error: any) {
      console.error('[ONBOARDING] ❌ Erro ao finalizar onboarding:', error);
      
      // Se chegou aqui mas o profile foi atualizado, considerar sucesso parcial
      // e deixar usuário prosseguir
      const errorMessage = error?.message || 'Erro desconhecido';
      
      if (errorMessage.includes('profile')) {
        showError('Erro crítico', 'Não foi possível atualizar seu perfil. Tente novamente.');
        return false;
      } else {
        // Erro não-crítico, permitir prosseguir
        console.warn('[ONBOARDING] ⚠️ Erro não-crítico, permitindo prosseguir');
        showInfo('Onboarding concluído', 'Seu perfil foi atualizado com sucesso!');
        
        // Atualizar estado local mesmo assim
        setState(prev => ({
          ...prev,
          is_completed: true,
          completed_steps: [0, 1, 2, 3, 4, 5, 6],
        }));
        
        return true;
      }
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