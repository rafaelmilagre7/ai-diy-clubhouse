
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MessageSquare, Trash2, Check } from "lucide-react";
import { Post } from "@/types/forumTypes";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getInitials, getAvatarUrl } from "@/utils/user";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { deleteForumPost } from "@/lib/supabase/rpc";
import { Separator } from "@/components/ui/separator";
import { usePostInteractions } from "@/hooks/usePostInteractions";

interface PostItemProps {
  post: Post;
  topicId: string;
  isTopicAuthor: boolean;
  isAdmin: boolean;
  currentUserId?: string;
  onReplyAdded?: () => void;
  topicAuthorId: string;
}

export function PostItem({ 
  post, 
  topicId, 
  isTopicAuthor, 
  isAdmin, 
  currentUserId,
  onReplyAdded,
  topicAuthorId
}: PostItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingSolution, setIsMarkingSolution] = useState(false);
  const isPostAuthor = currentUserId === post.user_id;
  const canDelete = isAdmin || isPostAuthor;
  const canMarkAsSolution = isTopicAuthor || isAdmin;
  
  const handleDelete = async () => {
    if (!canDelete) return;
    
    try {
      setIsDeleting(true);
      const result = await deleteForumPost(post.id);
      
      if (!result.success) {
        throw new Error(result.error || "Erro ao excluir resposta");
      }
      
      toast.success("Resposta excluída com sucesso");
      
      // Recarregar a lista de posts
      if (onReplyAdded) {
        onReplyAdded();
      }
      
    } catch (error: any) {
      console.error("Erro ao excluir resposta:", error);
      toast.error(`Não foi possível excluir a resposta: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const markAsSolution = async () => {
    if (!canMarkAsSolution) return;
    
    try {
      setIsMarkingSolution(true);
      
      // 1. Marcar este post como solução
      const { error: postError } = await supabase
        .from('forum_posts')
        .update({ is_solution: true })
        .eq('id', post.id);
        
      if (postError) throw postError;
      
      // 2. Marcar o tópico como resolvido
      const { error: topicError } = await supabase
        .from('forum_topics')
        .update({ is_solved: true })
        .eq('id', topicId);
        
      if (topicError) throw topicError;
      
      toast.success("Resposta marcada como solução");
      
      // Recarregar a lista de posts
      if (onReplyAdded) {
        onReplyAdded();
      }
      
    } catch (error: any) {
      console.error("Erro ao marcar resposta como solução:", error);
      toast.error(`Não foi possível marcar como solução: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsMarkingSolution(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src={post.profiles?.avatar_url ? getAvatarUrl(post.profiles.avatar_url) : undefined} />
          <AvatarFallback>{getInitials(post.profiles?.name)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{post.profiles?.name || "Usuário"}</span>
              <span className="text-sm text-muted-foreground ml-2">
                {format(new Date(post.created_at), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
              
              {post.user_id === topicAuthorId && (
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full ml-2">
                  Autor
                </span>
              )}
              
              {post.is_solution && (
                <span className="bg-green-500/20 text-green-500 text-xs px-2 py-0.5 rounded-full ml-2 flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Solução
                </span>
              )}
            </div>
            
            <div className="flex items-center">
              {(canDelete || canMarkAsSolution) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canMarkAsSolution && !post.is_solution && (
                      <DropdownMenuItem 
                        onClick={markAsSolution}
                        disabled={isMarkingSolution}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Marcar como solução
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir resposta
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          <div className="mt-3 prose prose-sm dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </div>
      </div>
    </Card>
  );
}
