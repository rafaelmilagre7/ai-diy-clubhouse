
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { NewTopicForm } from "./NewTopicForm";
import { useNavigate } from "react-router-dom";
import { PenLine } from "lucide-react";

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
        {/* Header com gradiente sutil */}
        <DialogHeader className="px-6 py-3 border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <PenLine className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Criar Novo Tópico
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Compartilhe suas ideias e conhecimento com a comunidade
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <NewTopicForm 
            categoryId={preselectedCategory}
            categorySlug={preselectedCategory}
            onSuccess={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
