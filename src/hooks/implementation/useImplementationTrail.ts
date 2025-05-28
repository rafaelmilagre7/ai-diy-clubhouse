
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImplementationTrail } from '@/types/implementation-trail';
import { sanitizeTrailData } from './useImplementationTrail.utils';

export const useImplementationTrail = () => {
  const { user } = useAuth();
  const [trail, setTrail] = useState<ImplementationTrail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar trilha existente
  const loadTrail = useCallback(async (forceReload = false) => {
    if (!user?.id) {
      console.log('Usuário não definido, não carregando trilha');
      return;
    }

    try {
      if (forceReload) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError(null);
      console.log('🔄 Carregando trilha para usuário:', user.id);

      const { data, error: trailError } = await supabase
        .from('implementation_trails')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (trailError) {
        console.error('❌ Erro ao carregar trilha:', trailError);
        throw trailError;
      }

      console.log('📊 Dados da trilha retornados:', data);

      if (data?.trail_data) {
        console.log('✅ Trilha encontrada, sanitizando dados...');
        const sanitizedTrail = sanitizeTrailData(data.trail_data);
        
        if (sanitizedTrail) {
          console.log('✅ Trilha sanitizada com sucesso:', sanitizedTrail);
          setTrail(sanitizedTrail);
        } else {
          console.log('⚠️ Falha ao sanitizar trilha');
          setTrail(null);
        }
      } else {
        console.log('ℹ️ Nenhuma trilha encontrada para o usuário');
        setTrail(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar trilha:', error);
      setError('Erro ao carregar trilha de implementação');
      setTrail(null);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  // Função para gerar nova trilha
  const generateImplementationTrail = useCallback(async (onboardingData: any = null) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      setRegenerating(true);
      setError(null);
      console.log('🚀 Iniciando geração da trilha para usuário:', user.id);

      // Buscar dados do quick_onboarding se não fornecidos
      let userData = onboardingData;
      if (!userData) {
        console.log('📝 Buscando dados do quick_onboarding...');
        
        const { data: quickData, error: quickError } = await supabase
          .from('quick_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (quickError) {
          console.error('❌ Erro ao buscar quick_onboarding:', quickError);
          throw new Error('Não foi possível encontrar seus dados de onboarding');
        }

        if (!quickData) {
          throw new Error('Complete o onboarding antes de gerar a trilha');
        }

        console.log('✅ Dados do quick_onboarding encontrados:', quickData);

        // Validar dados essenciais
        if (!quickData.company_name || !quickData.ai_knowledge_level) {
          throw new Error('Complete seu perfil antes de gerar a trilha');
        }

        // Estruturar dados para envio
        userData = {
          personal_info: {
            name: quickData.name,
            email: quickData.email
          },
          professional_info: {
            company_name: quickData.company_name,
            role: quickData.role,
            company_size: quickData.company_size,
            company_segment: quickData.company_segment,
            annual_revenue_range: quickData.annual_revenue_range
          },
          ai_experience: {
            knowledge_level: quickData.ai_knowledge_level,
            uses_ai: quickData.uses_ai,
            main_goal: quickData.main_goal
          }
        };
      }

      console.log('📤 Enviando dados para edge function:', userData);

      // Chamar edge function
      const { data, error: functionError } = await supabase.functions.invoke('generate-implementation-trail', {
        body: { 
          user_id: user.id,
          onboarding_data: userData 
        }
      });

      if (functionError) {
        console.error('❌ Erro da edge function:', functionError);
        throw new Error(`Erro ao gerar trilha: ${functionError.message}`);
      }

      if (!data?.success) {
        console.error('❌ Edge function retornou erro:', data);
        throw new Error(data?.error || 'Erro desconhecido ao gerar trilha');
      }

      if (data?.trail_data) {
        console.log('✅ Trilha gerada com sucesso:', data.trail_data);
        const sanitizedTrail = sanitizeTrailData(data.trail_data);
        setTrail(sanitizedTrail);
        toast.success('Trilha de implementação gerada com sucesso!');
      } else {
        throw new Error('Trilha gerada, mas dados inválidos');
      }

    } catch (error) {
      console.error('❌ Erro ao gerar trilha:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar trilha de implementação';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setRegenerating(false);
    }
  }, [user?.id]);

  // Carregar trilha ao inicializar
  useEffect(() => {
    if (user?.id) {
      console.log('🏁 Componente montado, carregando trilha...');
      loadTrail();
    }
  }, [user?.id, loadTrail]);

  // Determinar se há conteúdo válido
  const hasContent = trail && (
    (trail.priority1 && trail.priority1.length > 0) ||
    (trail.priority2 && trail.priority2.length > 0) ||
    (trail.priority3 && trail.priority3.length > 0)
  );

  console.log('🎯 Hook state:', {
    hasContent: !!hasContent,
    trail: trail ? 'presente' : 'ausente',
    isLoading,
    regenerating,
    refreshing,
    error
  });

  return {
    trail,
    isLoading,
    regenerating,
    refreshing,
    error,
    hasContent: !!hasContent,
    refreshTrail: loadTrail,
    generateImplementationTrail
  };
};
