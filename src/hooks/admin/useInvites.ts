
import { useInviteCreate } from "./invites/useInviteCreate";
import { useInviteDelete } from "./invites/useInviteDelete";
import { useInviteResend } from "./invites/useInviteResend";
import { useInvitesList } from "./invites/useInvitesList";
import { useSmartInviteCache } from "./invites/useSmartInviteCache";
import { useRealtimeInvites } from "./invites/useRealtimeInvites";
import type { Invite, CreateInviteParams } from "./invites/types";
import { useEffect, useState } from "react";

export type { Invite };

export const useInvites = () => {
  const { invites, loading, fetchInvites } = useInvitesList();
  const { createInvite: createInviteHook, loading: isCreating } = useInviteCreate();
  const { deleteInvite, isDeleting } = useInviteDelete();
  const { resendInvite, isSending } = useInviteResend();
  
  // Estado para rastrear convites específicos sendo reenviados
  const [resendingInvites, setResendingInvites] = useState<Set<string>>(new Set());
  
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
      console.log("🗑️ [USE-INVITES] Iniciando exclusão de convite:", {
        inviteId,
        timestamp: new Date().toISOString()
      });
      
      // Update otimista - remover do cache imediatamente
      removeInviteFromCache(inviteId);
      console.log("⚡ [USE-INVITES] Update otimista aplicado - convite removido da UI");
      
      // Executar exclusão no backend
      await deleteInvite(inviteId);
      console.log("✅ [USE-INVITES] Convite excluído com sucesso no backend");
      
      // Invalidar cache para garantir consistência
      await invalidateAllInviteData();
      console.log("🔄 [USE-INVITES] Cache invalidado");
      
      // CORREÇÃO: Recarregar lista após invalidação do cache
      await fetchInvites();
      console.log("📋 [USE-INVITES] Lista de convites recarregada do backend");
      
    } catch (error) {
      console.error("❌ [USE-INVITES] Erro ao deletar convite:", error);
      
      // Recarregar dados em caso de erro para reverter update otimista
      console.log("🔄 [USE-INVITES] Recarregando dados devido ao erro");
      await fetchInvites();
      throw error;
    }
  };

  const handleResendInvite = async (invite: Invite, channels?: ('email' | 'whatsapp')[], whatsappNumber?: string) => {
    try {
      console.log("🔄 [USE-INVITES] Iniciando reenvio com feedback visual:", {
        inviteId: invite.id,
        email: invite.email,
        channels: channels || ['email']
      });
      
      // Marcar convite como sendo reenviado
      setResendingInvites(prev => new Set(prev).add(invite.id));
      
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
    } finally {
      // Remover convite da lista de reenvios
      setResendingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(invite.id);
        return newSet;
      });
    }
  };

  // Função para verificar se um convite específico está sendo reenviado
  const isInviteResending = (inviteId: string) => {
    return resendingInvites.has(inviteId);
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
    isInviteResending,
    // Funções de cache para uso avançado
    prefetchCriticalData,
    invalidateAllInviteData
  };
};
