
import { useState, useEffect, useCallback } from "react";
import { useInviteCreate } from "./invites/useInviteCreate";
import { useInviteDelete } from "./invites/useInviteDelete";
import { useInviteResend } from "./invites/useInviteResend";
import { useInvitesList } from "./invites/useInvitesList";
import type { Invite } from "./invites/types";

export type { Invite };

export const useInvites = () => {
  const { invites, loading, fetchInvites } = useInvitesList();
  const { createInvite, loading: isCreating } = useInviteCreate();
  const { deleteInvite, isDeleting } = useInviteDelete();
  const { resendInvite, isSending } = useInviteResend();

  const handleCreateInvite = async (email: string, roleId: string, notes?: string) => {
    try {
      const result = await createInvite({ email, roleId, notes });
      await fetchInvites();
      return result;
    } catch (error) {
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
