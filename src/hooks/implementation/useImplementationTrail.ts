
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { ImplementationTrail } from '@/types/implementation-trail';
import { useTrailCache } from './useTrailCache';
import { toast } from 'sonner';

export const useImplementationTrail = () => {
  const { user, profile } = useAuth();
  const [trail, setTrail] = useState<ImplementationTrail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Criar hash do perfil para cache
  const profileHash = useMemo(() => {
    if (!profile) return '';
    
    const profileData = {
      name: profile.name || '',
      company: profile.company_name || '',
      industry: profile.industry || '',
      role: profile.role || ''
    };
    
    return btoa(JSON.stringify(profileData));
  }, [profile?.name, profile?.company_name, profile?.industry, profile?.role]);

  const { 
    cachedTrail, 
    saveToCache, 
    invalidateCache, 
    isCacheValid 
  } = useTrailCache(user?.id || '', profileHash);

  // Verificar se tem conteúdo válido
  const hasContent = useMemo(() => {
    if (!trail) return false;
    
    const hasSolutions = (
      (trail.priority1 && trail.priority1.length > 0) ||
      (trail.priority2 && trail.priority2.length > 0) ||
      (trail.priority3 && trail.priority3.length > 0)
    );
    
    const hasLessons = trail.recommended_lessons && trail.recommended_lessons.length > 0;
    
    return hasSolutions || hasLessons;
  }, [trail]);

  // Carregar trilha do cache
  useEffect(() => {
    if (cachedTrail && isCacheValid) {
      setTrail(cachedTrail);
      console.log('✅ Trilha carregada do cache');
    }
  }, [cachedTrail, isCacheValid]);

  // Função para gerar trilha com IA
  const generateImplementationTrail = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    setIsRegenerating(true);
    setError(null);

    try {
      console.log('🤖 Iniciando geração de trilha com IA...');

      // Chamar Edge Function para geração
      const { data, error: edgeError } = await supabase.functions.invoke('generate-implementation-trail', {
        body: { user_id: user.id }
      });

      if (edgeError) {
        console.error('❌ Erro na Edge Function:', edgeError);
        throw new Error(`Erro ao gerar trilha: ${edgeError.message}`);
      }

      if (!data?.trail_data) {
        throw new Error('Dados da trilha não foram retornados');
      }

      console.log('✅ Trilha gerada com sucesso:', data.trail_data);
      
      const newTrail = data.trail_data as ImplementationTrail;
      setTrail(newTrail);
      
      // Salvar no cache
      saveToCache(newTrail);
      
      toast.success('Trilha personalizada gerada com sucesso!');
      
    } catch (err) {
      console.error('❌ Erro ao gerar trilha:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro ao gerar trilha: ${errorMessage}`);
      throw err;
    } finally {
      setIsRegenerating(false);
    }
  }, [user?.id, saveToCache]);

  // Função para atualizar trilha
  const refreshTrail = useCallback(async (force = false): Promise<void> => {
    if (!user?.id) return;

    // Se temos cache válido e não é forçado, não fazer nada
    if (isCacheValid && !force) {
      console.log('Cache válido, não é necessário atualizar');
      return;
    }

    try {
      await generateImplementationTrail();
    } catch (err) {
      console.error('Erro ao atualizar trilha:', err);
      // Em caso de erro, manter trilha atual se existir
    }
  }, [user?.id, isCacheValid, generateImplementationTrail]);

  // Função para invalidar cache
  const clearCache = useCallback(() => {
    invalidateCache();
    setTrail(null);
    toast.success('Cache da trilha limpo');
  }, [invalidateCache]);

  return {
    trail,
    isLoading,
    regenerating: isRegenerating,
    error,
    hasContent,
    generateImplementationTrail,
    refreshTrail,
    clearCache
  };
};
