
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Flag, Pin, Lock, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useModeration } from "@/hooks/community/useModeration";
import { useDeleteConfirmation } from "@/hooks/community/useDeleteConfirmation";
import { DeleteSuggestionDialog } from "@/components/suggestions/details/DeleteSuggestionDialog";

interface ModerationActionsProps {
  type: "topic" | "post";
  itemId: string;
  currentState: {
    isPinned?: boolean;
    isLocked?: boolean;
    isHidden?: boolean;
  };
  onReport: () => void;
  onSuccess?: () => void;
}

export const ModerationActions = ({
  type,
  itemId,
  currentState,
  onReport,
  onSuccess
}: ModerationActionsProps) => {
  const { isAdmin } = useAuth();
  const { pinTopic, unpinTopic, lockTopic, unlockTopic, deleteTopic } = useModeration();
  const { showDeleteDialog, isDeleting, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteConfirmation();

  const handlePin = () => {
    if (currentState.isPinned) {
      unpinTopic(itemId);
    } else {
      pinTopic(itemId);
    }
    onSuccess?.();
  };

  const handleLock = () => {
    if (currentState.isLocked) {
      unlockTopic(itemId);
    } else {
      lockTopic(itemId);
    }
    onSuccess?.();
  };

  const handleDelete = () => {
    openDeleteDialog(() => {
      deleteTopic(itemId);
      onSuccess?.();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onReport}>
          <Flag className="h-4 w-4 mr-2" />
          Reportar
        </DropdownMenuItem>
        
        {type === "topic" && isAdmin && (
          <>
            <DropdownMenuItem onClick={handlePin}>
              <Pin className="h-4 w-4 mr-2" />
              {currentState.isPinned ? "Desafixar" : "Fixar"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLock}>
              <Lock className="h-4 w-4 mr-2" />
              {currentState.isLocked ? "Destravar" : "Travar"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Tópico
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
      
      <DeleteSuggestionDialog
        isOpen={showDeleteDialog}
        onOpenChange={closeDeleteDialog}
        onConfirmDelete={confirmDelete}
      />
    </DropdownMenu>
  );
};
