
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SmartCacheOptions {
  prefetchOnMount?: boolean;
  backgroundRefresh?: boolean;
  optimisticUpdates?: boolean;
}

export const useSmartInviteCache = (options: SmartCacheOptions = {}) => {
  const queryClient = useQueryClient();
  const { prefetchOnMount = true, backgroundRefresh = true, optimisticUpdates = true } = options;

  const cacheKeys = useMemo(() => ({
    invitesList: ['invites', 'list'],
    inviteAnalytics: ['invites', 'analytics'],
    inviteDeliveries: ['invites', 'deliveries'],
    inviteAudit: ['invites', 'audit']
  }), []);

  const invalidateAllInviteData = useCallback(async () => {
    console.log('🔄 [SMART-CACHE] Invalidando todos os dados de convites');
    
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: cacheKeys.invitesList }),
      queryClient.invalidateQueries({ queryKey: cacheKeys.inviteAnalytics }),
      queryClient.invalidateQueries({ queryKey: cacheKeys.inviteDeliveries }),
      queryClient.invalidateQueries({ queryKey: cacheKeys.inviteAudit })
    ]);
  }, [queryClient, cacheKeys]);

  const prefetchCriticalData = useCallback(async () => {
    try {
      console.log('⚡ [SMART-CACHE] Pré-carregando dados críticos');
      
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: cacheKeys.invitesList,
          queryFn: async () => {
            const { data, error } = await supabase
              .from('invites')
              .select(`
                id,
                email,
                role_id,
                token,
                expires_at,
                used_at,
                created_at,
                created_by,
                last_sent_at,
                send_attempts,
                notes,
                whatsapp_number,
                user_roles:role_id!inner(id, name, description)
              `)
              .order('created_at', { ascending: false })
              .limit(50);

            if (error) throw error;
            return data;
          },
          staleTime: 2 * 60 * 1000, // 2 minutos
          gcTime: 5 * 60 * 1000 // 5 minutos
        }),

        queryClient.prefetchQuery({
          queryKey: cacheKeys.inviteAnalytics,
          queryFn: async () => {
            const { data, error } = await supabase
              .from('invites')
              .select('id, created_at, used_at, expires_at')
              .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

            if (error) throw error;
            return data;
          },
          staleTime: 5 * 60 * 1000 // 5 minutos
        })
      ]);

      console.log('✅ [SMART-CACHE] Dados críticos pré-carregados');
    } catch (error) {
      console.warn('⚠️ [SMART-CACHE] Erro no pré-carregamento:', error);
    }
  }, [queryClient, cacheKeys]);

  const updateInviteInCache = useCallback((inviteId: string, updates: any) => {
    if (!optimisticUpdates) return;

    console.log(`🎯 [SMART-CACHE] Atualizando convite ${inviteId} no cache`);

    queryClient.setQueryData(cacheKeys.invitesList, (oldData: any) => {
      if (!oldData) return oldData;

      return oldData.map((invite: any) => 
        invite.id === inviteId 
          ? { ...invite, ...updates, updated_at: new Date().toISOString() }
          : invite
      );
    });
  }, [queryClient, cacheKeys, optimisticUpdates]);

  const addInviteToCache = useCallback((newInvite: any) => {
    if (!optimisticUpdates) return;

    console.log('➕ [SMART-CACHE] Adicionando novo convite ao cache');

    queryClient.setQueryData(cacheKeys.invitesList, (oldData: any) => {
      if (!oldData) return [newInvite];
      return [newInvite, ...oldData];
    });
  }, [queryClient, cacheKeys, optimisticUpdates]);

  const removeInviteFromCache = useCallback((inviteId: string) => {
    if (!optimisticUpdates) return;

    console.log(`🗑️ [SMART-CACHE] Removendo convite ${inviteId} do cache`);

    queryClient.setQueryData(cacheKeys.invitesList, (oldData: any) => {
      if (!oldData) return oldData;
      return oldData.filter((invite: any) => invite.id !== inviteId);
    });
  }, [queryClient, cacheKeys, optimisticUpdates]);

  const getCachedInvites = useCallback(() => {
    return queryClient.getQueryData(cacheKeys.invitesList) as any[] | undefined;
  }, [queryClient, cacheKeys]);

  return {
    cacheKeys,
    invalidateAllInviteData,
    prefetchCriticalData,
    updateInviteInCache,
    addInviteToCache,
    removeInviteFromCache,
    getCachedInvites
  };
};
