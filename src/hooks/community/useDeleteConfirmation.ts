
import { useState } from 'react';

interface DeleteAction {
  type: 'topic' | 'post';
  itemId: string;
  action: () => Promise<void>;
  title?: string;
  description?: string;
}

export const useDeleteConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingAction, setPendingAction] = useState<DeleteAction | null>(null);

  const openDeleteDialog = (action: DeleteAction) => {
    setPendingAction(action);
    setIsOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsOpen(false);
    setPendingAction(null);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    if (!pendingAction) return;

    setIsDeleting(true);
    try {
      await pendingAction.action();
      closeDeleteDialog();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      setIsDeleting(false);
    }
  };

  return {
    isOpen,
    isDeleting,
    pendingAction,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete
  };
};
