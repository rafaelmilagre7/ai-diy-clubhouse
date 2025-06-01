
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImplementationTrail } from '@/types/implementation-trail';
import { sanitizeTrailData } from './useImplementationTrail.utils';
import { useTrailCache } from './useTrailCache';

export const useImplementationTrail = () => {
  const { user, profile } = useAuth();
  const [trail, setTrail] = useState<ImplementationTrail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Criar hash do perfil para invalidação de cache
  const profileHash = useMemo(() => {
    if (!profile) return '';
    return btoa(JSON.stringify({
      role: profile.role,
      company: profile.company,
      industry: profile.industry,
      position: profile.position
    }));
  }, [profile]);

  // Hook de cache
  const { cachedTrail, saveToCache, invalidateCache, isCacheValid } = useTrailCache(
    user?.id || '', 
    profileHash
  );

  // Função para carregar trilha existente
  const loadTrail = useCallback(async (forceReload = false) => {
    if (!user?.id) {
      console.log('❌ Usuário não definido, não carregando trilha');
      return;
    }

    // Usar cache se válido e não forçando reload
    if (!forceReload && isCacheValid && cachedTrail) {
      console.log('⚡ Usando trilha do cache');
      setTrail(cachedTrail);
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

      // Buscar trilha mais recente
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
          saveToCache(sanitizedTrail); // Salvar no cache
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
  }, [user?.id, isCacheValid, cachedTrail, saveToCache]);

  // Função para gerar nova trilha usando edge function inteligente
  const generateImplementationTrail = useCallback(async () => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      setRegenerating(true);
      setError(null);
      invalidateCache(); // Limpar cache antes de gerar nova trilha
      
      console.log('🚀 Iniciando geração inteligente da trilha para usuário:', user.id);

      // Verificar se o usuário tem dados de onboarding
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (onboardingError) {
        console.error('❌ Erro ao verificar onboarding:', onboardingError);
        throw new Error('Erro ao verificar dados de onboarding');
      }

      if (!onboardingData || !onboardingData.is_completed) {
        console.log('⚠️ Onboarding não completado, redirecionando...');
        toast.error('Complete seu onboarding para gerar uma trilha personalizada');
        setError('Onboarding não completado');
        return;
      }

      // Usar a edge function inteligente
      const { data, error: functionError } = await supabase.functions.invoke('generate-smart-trail', {
        body: { user_id: user.id }
      });

      console.log('📤 Resposta da edge function:', { data, error: functionError });

      if (functionError) {
        console.error('❌ Erro da edge function:', functionError);
        throw new Error(`Erro ao gerar trilha: ${functionError.message}`);
      }

      if (!data?.success) {
        console.error('❌ Edge function retornou erro:', data);
        throw new Error(data?.error || 'Erro desconhecido ao gerar trilha');
      }

      if (data?.trail_data) {
        console.log('✅ Trilha inteligente gerada com sucesso:', data.trail_data);
        const sanitizedTrail = sanitizeTrailData(data.trail_data);
        if (sanitizedTrail) {
          setTrail(sanitizedTrail);
          saveToCache(sanitizedTrail); // Salvar nova trilha no cache
          toast.success('Trilha personalizada gerada com IA!', {
            description: 'Suas recomendações foram atualizadas com base no seu perfil'
          });
        } else {
          throw new Error('Trilha gerada, mas dados inválidos');
        }
      } else {
        throw new Error('Trilha gerada, mas dados não retornados');
      }

    } catch (error) {
      console.error('❌ Erro ao gerar trilha:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar trilha de implementação';
      setError(errorMessage);
      
      // Se for erro relacionado a dados faltantes, tentar carregar trilha existente
      if (errorMessage.includes('onboarding') || errorMessage.includes('não encontrado')) {
        console.log('🔄 Tentando carregar trilha existente após erro...');
        await loadTrail(true);
        if (trail) {
          toast.success('Trilha existente carregada!');
        } else {
          toast.error('Complete seu onboarding para gerar uma trilha personalizada');
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setRegenerating(false);
    }
  }, [user?.id, loadTrail, trail, invalidateCache, saveToCache]);

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
    (trail.priority3 && trail.priority3.length > 0) ||
    (trail.recommended_lessons && trail.recommended_lessons.length > 0)
  );

  console.log('🎯 Hook state:', {
    hasContent: !!hasContent,
    trail: trail ? 'presente' : 'ausente',
    isLoading,
    regenerating,
    refreshing,
    error,
    cacheValid: isCacheValid
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
