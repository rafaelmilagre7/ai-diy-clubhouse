
import { useInvitesList } from './invites/useInvitesList';
import { useInviteCreate } from './invites/useInviteCreate';
import { useInviteResend } from './invites/useInviteResend';
import { useInviteDelete } from './invites/useInviteDelete';

export const useInvites = () => {
  const { invites, loading: listLoading, fetchInvites } = useInvitesList();
  const { createInvite, isCreating } = useInviteCreate();
  const { resendInvite, isResending, isInviteResending } = useInviteResend();
  const { deleteInvite, isDeleting } = useInviteDelete();

  return {
    invites,
    loading: listLoading,
    createInvite,
    deleteInvite,
    resendInvite,
    isCreating,
    isDeleting,
    isResending,
    isInviteResending,
    fetchInvites
  };
};
