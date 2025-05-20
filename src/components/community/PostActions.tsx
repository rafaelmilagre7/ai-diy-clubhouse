
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  MoreHorizontal,
  Flag,
  Trash2 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SolutionButton } from "./SolutionButton";

interface PostActionsProps {
  // Propriedades básicas
  postId: string;
  isOwner: boolean;
  isAdmin?: boolean;
  isReply?: boolean;
  
  // Funcionalidades de solução
  isSolutionPost?: boolean;
  canMarkAsSolved?: boolean;  
  isSubmitting?: boolean;
  onMarkAsSolved?: () => void;
  onUnmarkAsSolved?: () => void;
  
  // Outras ações
  onReply?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

export function PostActions({
  postId,
  isOwner,
  isAdmin = false,
  isReply = false,
  isSolutionPost = false,
  canMarkAsSolved = false,
  isSubmitting = false,
  onMarkAsSolved,
  onUnmarkAsSolved,
  onReply,
  onDelete,
  onReport
}: PostActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="ghost" size="sm">
        <ThumbsUp className="h-4 w-4 mr-1" />
        <span>Útil</span>
      </Button>
      
      {isReply && onReply && (
        <Button variant="ghost" size="sm" onClick={onReply}>
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>Responder</span>
        </Button>
      )}
      
      {/* Botão de marcar como solução - apenas mostra se canMarkAsSolved for true */}
      {isReply && canMarkAsSolved && onMarkAsSolved && onUnmarkAsSolved && (
        <SolutionButton 
          isSolved={isSolutionPost}
          isSubmitting={isSubmitting}
          canMarkAsSolved={canMarkAsSolved}
          onMarkAsSolved={onMarkAsSolved}
          onUnmarkAsSolved={onUnmarkAsSolved}
          postId={postId}
        />
      )}
      
      <Button variant="ghost" size="sm">
        <Share2 className="h-4 w-4" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isOwner && !isAdmin && onReport && (
            <DropdownMenuItem onClick={onReport}>
              <Flag className="h-4 w-4 mr-2" />
              <span>Reportar</span>
            </DropdownMenuItem>
          )}
          
          {(isOwner || isAdmin) && onDelete && (
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Excluir</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
