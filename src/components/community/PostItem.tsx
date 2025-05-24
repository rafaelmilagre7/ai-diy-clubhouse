
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CheckCircle2, MoreHorizontal, MessageSquare, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getInitials } from "@/utils/user";
import { useState } from "react";
import { ReplyForm } from "./ReplyForm";

interface PostItemProps {
  post: {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    is_solution?: boolean;
    profiles?: {
      id: string;
      name: string;
      avatar_url?: string | null;
      role?: string;
    } | null;
  };
  canMarkAsSolution?: boolean;
  isAuthor?: boolean;
  onMarkAsSolution?: () => void;
  isMarkingSolved?: boolean;
}

export const PostItem = ({ 
  post, 
  canMarkAsSolution = false,
  isAuthor = false,
  onMarkAsSolution,
  isMarkingSolved = false
}: PostItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const formattedDate = formatDistanceToNow(
    new Date(post.created_at), 
    { addSuffix: true, locale: ptBR }
  );

  const handleMarkAsSolution = () => {
    if (onMarkAsSolution) {
      onMarkAsSolution();
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-background">
      {/* Cabeçalho do Post */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.profiles?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(post.profiles?.name || 'U')}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{post.profiles?.name || 'Usuário'}</span>
              
              {post.profiles?.role === 'admin' && (
                <Badge variant="default" className="text-xs">Admin</Badge>
              )}
              
              {post.is_solution && (
                <Badge className="bg-green-600 hover:bg-green-500 gap-1 text-white text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  Solução
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>
        </div>

        {/* Menu de Ações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowReplyForm(!showReplyForm)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Responder
            </DropdownMenuItem>
            
            {canMarkAsSolution && !post.is_solution && (
              <DropdownMenuItem 
                onClick={handleMarkAsSolution}
                disabled={isMarkingSolved}
                className="text-green-600"
              >
                {isMarkingSolved ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Marcar como solução
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem>Reportar</DropdownMenuItem>
            
            {isAuthor && (
              <>
                <DropdownMenuItem>Editar</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Conteúdo do Post */}
      <div className="prose prose-sm max-w-none mb-3">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
      
      {/* Formulário de Resposta */}
      {showReplyForm && (
        <div className="mt-4 pt-4 border-t">
          <ReplyForm 
            topicId={post.id} // Isso precisa ser o topic_id, não o post_id
            parentId={post.id}
            onSuccess={() => setShowReplyForm(false)}
            onCancel={() => setShowReplyForm(false)}
            placeholder="Responder a este post..."
          />
        </div>
      )}
    </div>
  );
};
