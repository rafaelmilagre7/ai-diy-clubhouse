
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewTopicForm } from "./NewTopicForm";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar novo tópico</DialogTitle>
        </DialogHeader>
        <NewTopicForm 
          categoryId={preselectedCategory}
          categorySlug={preselectedCategory}
        />
      </DialogContent>
    </Dialog>
  );
};
