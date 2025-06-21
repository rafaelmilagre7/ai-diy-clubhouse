
import { useInviteCreate } from "./invites/useInviteCreate";
import { useInviteDelete } from "./invites/useInviteDelete";
import { useInviteResend } from "./invites/useInviteResend";
import { useInvitesList } from "./invites/useInvitesList";
import type { Invite, CreateInviteParams } from "./invites/types";

export type { Invite };

export const useInvites = () => {
  const { invites, loading, fetchInvites } = useInvitesList();
  const { createInvite: createInviteHook, loading: isCreating } = useInviteCreate();
  const { deleteInvite, isDeleting } = useInviteDelete();
  const { resendInvite, isSending } = useInviteResend();

  // Função atualizada para suportar todos os parâmetros do CreateInviteParams
  const handleCreateInvite = async (params: CreateInviteParams) => {
    try {
      console.log("🎯 useInvites: Criando convite com parâmetros completos:", params);

      const result = await createInviteHook(params);
      
      if (result?.status === 'success') {
        console.log("✅ useInvites: Convite criado com sucesso, atualizando lista");
        await fetchInvites();
      }
      
      return result;
    } catch (error) {
      console.error("❌ useInvites: Erro ao criar convite:", error);
      throw error;
    }
  };

  // Manter compatibilidade com a interface antiga para não quebrar outros usos
  const handleCreateInviteLegacy = async (
    email: string, 
    roleId: string, 
    notes?: string,
    options?: {
      expiresIn?: string;
    }
  ) => {
    const params: CreateInviteParams = {
      email,
      roleId,
      notes,
      expiresIn: options?.expiresIn || '7 days',
      channels: ['email'], // Padrão apenas email para compatibilidade
    };

    return await handleCreateInvite(params);
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      console.log("🗑️ useInvites: Deletando convite:", inviteId);
      await deleteInvite(inviteId);
      await fetchInvites();
    } catch (error) {
      console.error("❌ useInvites: Erro ao deletar convite:", error);
      throw error;
    }
  };

  const handleResendInvite = async (invite: Invite) => {
    try {
      console.log("🔄 useInvites: Reenviando convite:", invite.id);
      await resendInvite(invite);
      await fetchInvites();
    } catch (error) {
      console.error("❌ useInvites: Erro ao reenviar convite:", error);
      throw error;
    }
  };

  return {
    invites,
    loading,
    isCreating,
    isDeleting,
    isSending,
    fetchInvites,
    // Nova interface principal
    createInvite: handleCreateInvite,
    // Interface legacy para compatibilidade
    createInviteLegacy: handleCreateInviteLegacy,
    deleteInvite: handleDeleteInvite,
    resendInvite: handleResendInvite
  };
};
