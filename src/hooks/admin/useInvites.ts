
import { useState, useEffect, useCallback } from "react";
import { useInviteCreate } from "./invites/useInviteCreate";
import { useInviteDelete } from "./invites/useInviteDelete";
import { useInviteResend } from "./invites/useInviteResend";
import { useInvitesList } from "./invites/useInvitesList";
import type { Invite, CreateInviteParams } from "./invites/types";

export type { Invite };

export const useInvites = () => {
  const { invites, loading, fetchInvites } = useInvitesList();
  const { createInvite, loading: isCreating } = useInviteCreate();
  const { deleteInvite, isDeleting } = useInviteDelete();
  const { resendInvite, isSending } = useInviteResend();

  const handleCreateInvite = async (
    email: string, 
    roleId: string, 
    notes?: string,
    options?: {
      expiresIn?: string;
      phone?: string;
      channelPreference?: 'email' | 'whatsapp' | 'both';
    }
  ) => {
    try {
      const params: CreateInviteParams = {
        email,
        roleId,
        notes,
        expiresIn: options?.expiresIn || '7 days',
        phone: options?.phone,
        channelPreference: options?.channelPreference || 'email'
      };

      console.log("🎯 Criando convite com parâmetros híbridos:", params);

      const result = await createInvite(params);
      await fetchInvites();
      return result;
    } catch (error) {
      console.error("❌ Erro ao criar convite:", error);
      throw error;
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      await deleteInvite(inviteId);
      await fetchInvites();
    } catch (error) {
      throw error;
    }
  };

  const handleResendInvite = async (invite: Invite) => {
    try {
      await resendInvite(invite);
      await fetchInvites();
    } catch (error) {
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
    createInvite: handleCreateInvite,
    deleteInvite: handleDeleteInvite,
    resendInvite: handleResendInvite
  };
};
