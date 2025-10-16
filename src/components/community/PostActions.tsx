
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  ThumbsUp, 
  MoreVertical, 
  Trash2,
  CheckCircle2
} from "lucide-react";

interface PostActionsProps {
  postId: string;
  isOwner: boolean;
  isAdmin: boolean;
  isReply: boolean;
  onReply: () => void;
  canMarkAsSolved?: boolean;
  isSolutionPost?: boolean;
  isSubmitting?: boolean;
  onMarkAsSolved?: () => void;
  onUnmarkAsSolved?: () => void;
  onDelete?: () => void;
}

export const PostActions = ({
  postId,
  isOwner,
  isAdmin,
  isReply,
  onReply,
  canMarkAsSolved = false,
  isSolutionPost = false,
  isSubmitting = false,
  onMarkAsSolved,
  onUnmarkAsSolved,
  onDelete
}: PostActionsProps) => {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <Button
        variant="ghost" 
        size="sm" 
        onClick={onReply}
        className="text-xs h-8"
      >
        <MessageSquare className="h-3.5 w-3.5 mr-1" />
        Responder
      </Button>
      
      {/* Botão para marcar como solução (visível apenas para autor do tópico ou admin) */}
      {canMarkAsSolved && (
        <Button
          variant={isSolutionPost ? "outline" : "ghost"}
          size="sm"
          onClick={isSolutionPost ? onUnmarkAsSolved : onMarkAsSolved}
          disabled={isSubmitting}
          className={`text-xs h-8 ${isSolutionPost ? "border-success text-success" : ""}`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          {isSolutionPost ? "Remover solução" : "É solução"}
        </Button>
      )}
      
      {/* Botão de exclusão visível apenas para o proprietário ou admin */}
      {(isOwner || isAdmin) && onDelete && (
        <Button
          variant="ghost" 
          size="sm"
          onClick={onDelete}
          className="text-xs h-8 text-destructive hover:text-destructive/90"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Excluir
        </Button>
      )}
    </div>
  );
};
