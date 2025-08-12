
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewTopicForm } from "./NewTopicForm";
import { useNavigate } from "react-router-dom";

interface CreateTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedCategory?: string;
}

export const CreateTopicDialog = ({ 
  open, 
  onOpenChange, 
  preselectedCategory 
}: CreateTopicDialogProps) => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Primeiro fecha o modal
    onOpenChange(false);
    
    // Depois navega para a categoria ou comunidade
    setTimeout(() => {
      if (preselectedCategory) {
        navigate(`/comunidade/categoria/${preselectedCategory}`);
      } else {
        navigate('/comunidade');
      }
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar novo tópico</DialogTitle>
        </DialogHeader>
        <NewTopicForm 
          categoryId={preselectedCategory}
          categorySlug={preselectedCategory}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
