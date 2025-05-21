
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageSquare, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface PostActionsProps {
  post: {
    id: string;
    content: string;
    user_id: string;
    topic_id: string;
    created_at: string;
    updated_at: string;
    profiles?: {
      id: string;
      name: string;
      avatar_url?: string | null;
      role?: string;
    } | null;
    replies?: any[];
    is_solution?: boolean;
  };
  isAuthor?: boolean;
  isSolution?: boolean;
  canMarkSolution?: boolean;
  onMarkAsSolution?: (postId: string) => void;
}

export const PostActions = ({
  post,
  isAuthor,
  isSolution,
  canMarkSolution,
  onMarkAsSolution,
}: PostActionsProps) => {
  const handleMarkAsSolution = () => {
    if (onMarkAsSolution) {
      onMarkAsSolution(post.id);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {isSolution && (
          <Badge className="bg-green-600 hover:bg-green-500 gap-1 text-white py-1 px-2">
            <CheckCircle2 className="h-3 w-3" />
            <span>Solução</span>
          </Badge>
        )}

        {post.replies && post.replies.length > 0 && (
          <Badge variant="outline" className="flex gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>{post.replies.length}</span>
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {canMarkSolution && !isSolution && (
          <Button
            variant="outline"
            size="sm"
            className="text-green-600 border-green-600 hover:bg-green-50"
            onClick={handleMarkAsSolution}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            <span>Marcar como solução</span>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Reportar</DropdownMenuItem>
            {isAuthor && <DropdownMenuItem>Editar</DropdownMenuItem>}
            {isAuthor && <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
