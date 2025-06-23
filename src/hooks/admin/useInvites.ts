import { useInviteCreate } from "./invites/useInviteCreate";
import { useInviteDelete } from "./invites/useInviteDelete";
import { useInviteResend } from "./invites/useInviteResend";
import { useInvitesList } from "./invites/useInvitesList";
import { useSmartInviteCache } from "./invites/useSmartInviteCache";
import { useRealtimeInvites } from "./invites/useRealtimeInvites";
import type { Invite, CreateInviteParams } from "./invites/types";
import { useEffect } from "react";

export type { Invite };

export const useInvites = () => {
  const { invites, loading, fetchInvites } = useInvitesList();
  const { createInvite: createInviteHook, loading: isCreating } = useInviteCreate();
  const { deleteInvite, isDeleting } = useInviteDelete();
  const { resendInvite, isSending } = useInviteResend();
  
  // Sistema de cache inteligente
  const {
    prefetchCriticalData,
    updateInviteInCache,
    addInviteToCache,
    removeInviteFromCache,
    invalidateAllInviteData
  } = useSmartInviteCache({
    prefetchOnMount: true,
    optimisticUpdates: true
  });

  // Real-time updates
  const { isConnected: realtimeConnected } = useRealtimeInvites();

  // Pré-carregar dados críticos na inicialização
  useEffect(() => {
    prefetchCriticalData();
  }, [prefetchCriticalData]);

  const handleCreateInvite = async (params: CreateInviteParams) => {
    try {
      console.log("🎯 useInvites: Criando convite com cache otimizado:", params);

      // Update otimista no cache
      const optimisticInvite = {
        id: `temp-${Date.now()}`,
        email: params.email,
        role_id: params.roleId,
        notes: params.notes,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        used_at: null,
        last_sent_at: null,
        send_attempts: 0,
        user_roles: { name: 'Carregando...', description: '' },
        _optimistic: true
      };

      addInviteToCache(optimisticInvite);

      const result = await createInviteHook(params);
      
      if (result?.status === 'success') {
        console.log("✅ useInvites: Convite criado com sucesso, atualizando cache");
        
        // Invalidar cache para obter dados reais
        await invalidateAllInviteData();
        
        // Buscar dados atualizados
        await fetchInvites();
      } else {
        // Remover convite otimista em caso de erro
        removeInviteFromCache(optimisticInvite.id);
      }
      
      return result;
    } catch (error) {
      console.error("❌ useInvites: Erro ao criar convite:", error);
      
      // Remover convite otimista em caso de erro
      const optimisticId = `temp-${Math.floor(Date.now() / 1000)}`;
      removeInviteFromCache(optimisticId);
      
      throw error;
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      console.log("🗑️ useInvites: Deletando convite com cache otimizado:", inviteId);
      
      // Update otimista - remover do cache imediatamente
      removeInviteFromCache(inviteId);
      
      await deleteInvite(inviteId);
      
      // Invalidar cache para garantir consistência
      await invalidateAllInviteData();
      
    } catch (error) {
      console.error("❌ useInvites: Erro ao deletar convite:", error);
      
      // Recarregar dados em caso de erro
      await fetchInvites();
      throw error;
    }
  };

  const handleResendInvite = async (invite: Invite, channels?: ('email' | 'whatsapp')[], whatsappNumber?: string) => {
    try {
      console.log("🔄 [USE-INVITES] Iniciando reenvio com sincronização:", {
        inviteId: invite.id,
        email: invite.email,
        channels: channels || ['email']
      });
      
      // Update otimista - atualizar tentativas localmente
      const newAttemptCount = (invite.send_attempts || 0) + 1;
      updateInviteInCache(invite.id, {
        last_sent_at: new Date().toISOString(),
        send_attempts: newAttemptCount
      });
      
      // Executar reenvio
      const result = await resendInvite(invite, channels, whatsappNumber);
      
      console.log("✅ [USE-INVITES] Reenvio concluído, sincronizando dados:", result);
      
      // Forçar atualização dos dados após sucesso
      await invalidateAllInviteData();
      await fetchInvites();
      
      return result;
      
    } catch (error) {
      console.error("❌ [USE-INVITES] Erro no reenvio:", error);
      
      // Reverter update otimista em caso de erro
      await fetchInvites();
      throw error;
    }
  };

  return {
    invites,
    loading,
    isCreating,
    isDeleting,
    isSending,
    realtimeConnected,
    fetchInvites,
    createInvite: handleCreateInvite,
    deleteInvite: handleDeleteInvite,
    resendInvite: handleResendInvite,
    // Funções de cache para uso avançado
    prefetchCriticalData,
    invalidateAllInviteData
  };
};
