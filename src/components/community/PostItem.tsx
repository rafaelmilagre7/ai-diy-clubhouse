
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { PostHeader } from "./PostHeader";
import { PostActions } from "./PostActions";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PostItemProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    is_solution?: boolean;
    profiles?: {
      name: string | null;
      avatar_url: string | null;
      role?: string | null;
    } | null;
  };
  topicId: string;
  isTopicAuthor?: boolean;
  isAdmin?: boolean;
  currentUserId?: string;
  onReplyAdded?: () => void;
  topicAuthorId?: string;
}

export const PostItem = ({
  post,
  topicId,
  isTopicAuthor = false,
  isAdmin = false,
  currentUserId,
  onReplyAdded,
  topicAuthorId
}: PostItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  // Determina se este usuário pode marcar a solução (autor do tópico ou admin)
  const canMarkAsSolved = (currentUserId === topicAuthorId || isAdmin) && !post.is_solution;
  
  const handleReply = () => {
    setShowReplyForm(!showReplyForm);
  };
  
  const handleMarkAsSolved = async () => {
    if (!currentUserId) {
      toast.error("Você precisa estar logado para realizar esta ação");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('mark_topic_as_solved', {
        topic_id: topicId,
        post_id: post.id
      });
      
      if (error) throw error;
      
      toast.success("Resposta marcada como solução!");
      
      // Invalidar queries para recarregar os dados
      queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forumTopics'] });
      queryClient.invalidateQueries({ queryKey: ['communityTopics'] });
      queryClient.invalidateQueries({ queryKey: ['forumStats'] });
      
    } catch (error: any) {
      console.error("Erro ao marcar como solução:", error);
      toast.error("Não foi possível marcar como solução");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUnmarkAsSolved = async () => {
    if (!currentUserId) {
      toast.error("Você precisa estar logado para realizar esta ação");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('unmark_topic_as_solved', {
        topic_id: topicId
      });
      
      if (error) throw error;
      
      toast.success("Solução removida do tópico!");
      
      // Invalidar queries para recarregar os dados
      queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forumTopics'] });
      queryClient.invalidateQueries({ queryKey: ['communityTopics'] });
      queryClient.invalidateQueries({ queryKey: ['forumStats'] });
      
    } catch (error: any) {
      console.error("Erro ao remover solução:", error);
      toast.error("Não foi possível remover a solução");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUserId) {
      toast.error("Você precisa estar logado para realizar esta ação");
      return;
    }
    
    if (!confirm("Tem certeza que deseja excluir esta mensagem?")) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('deleteForumPost', {
        post_id: post.id
      });
      
      if (error) throw error;
      
      toast.success("Mensagem excluída com sucesso!");
      
      // Invalidar queries para recarregar os dados
      queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
      
    } catch (error: any) {
      console.error("Erro ao excluir mensagem:", error);
      toast.error("Não foi possível excluir a mensagem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={post.is_solution ? "border-green-500 border-2" : ""}>
      <div className="p-4">
        <PostHeader 
          profile={post.profiles}
          createdAt={post.created_at}
          isTopicAuthor={isTopicAuthor}
          userId={currentUserId}
          isAdmin={isAdmin}
          isSolution={post.is_solution}
        />
        
        <div className="prose prose-sm dark:prose-invert max-w-none mt-3">
          {post.content}
        </div>
        
        <PostActions
          postId={post.id}
          isOwner={currentUserId === post.user_id}
          isAdmin={isAdmin}
          isReply={true}
          onReply={handleReply}
          canMarkAsSolved={canMarkAsSolved}
          isSolutionPost={post.is_solution}
          isSubmitting={isSubmitting}
          onMarkAsSolved={handleMarkAsSolved}
          onUnmarkAsSolved={handleUnmarkAsSolved}
          onDelete={handleDelete}
        />
        
        {showReplyForm && (
          <div className="mt-4 pl-4 border-l-2">
            {/* Implementar formulário de resposta aqui */}
            <div className="p-3 bg-muted/50 rounded-md">
              <textarea 
                className="w-full p-2 rounded-md border" 
                rows={3} 
                placeholder="Escreva sua resposta..."
              />
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  className="px-3 py-1 text-sm rounded-md"
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="px-3 py-1 text-sm bg-primary text-white rounded-md"
                  onClick={() => {
                    // Lógica para enviar resposta
                    if (onReplyAdded) onReplyAdded();
                    setShowReplyForm(false);
                  }}
                >
                  Responder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
