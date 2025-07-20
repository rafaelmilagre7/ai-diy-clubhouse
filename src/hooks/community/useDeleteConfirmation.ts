
import { useState } from "react";

export const useDeleteConfirmation = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteCallback, setDeleteCallback] = useState<(() => void) | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteDialog = (callback: () => void) => {
    setDeleteCallback(() => callback);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeleteCallback(null);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    if (!deleteCallback) return;
    
    setIsDeleting(true);
    try {
      await deleteCallback();
      closeDeleteDialog();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      setIsDeleting(false);
    }
  };

  return {
    showDeleteDialog,
    isDeleting,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete
  };
};
