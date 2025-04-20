
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Comment, CommentFormData } from '@/types/commentTypes';
import { toast } from 'sonner';

export const useToolComments = (toolId: string) => {
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Limpar formulário de resposta ao mudar de ferramenta
  useEffect(() => {
    setComment('');
    setReplyTo(null);
  }, [toolId]);

  // Buscar comentários
  const {
    data: comments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tool-comments', toolId],
    queryFn: async () => {
      if (!toolId) return [];

      console.log('Buscando comentários para a ferramenta:', toolId);

      // Primeiro, busca todos os comentários principais (sem parent_id)
      const { data: parentComments, error: parentError } = await supabase
        .from('tool_comments')
        .select(`
          *,
          profiles:user_id(name, avatar_url, role)
        `)
        .eq('tool_id', toolId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (parentError) throw parentError;

      // Depois, busca todas as respostas
      const { data: replies, error: repliesError } = await supabase
        .from('tool_comments')
        .select(`
          *,
          profiles:user_id(name, avatar_url, role)
        `)
        .eq('tool_id', toolId)
        .not('parent_id', 'is', null)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      // Organiza as respostas dentro dos comentários principais
      const commentsWithReplies = parentComments.map((parentComment: Comment) => {
        const commentReplies = replies.filter(
          (reply: Comment) => reply.parent_id === parentComment.id
        );
        return { ...parentComment, replies: commentReplies };
      });

      return commentsWithReplies;
    },
    enabled: !!toolId
  });

  // Função para adicionar comentário ou resposta
  const handleSubmitComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar logado para comentar.");
      return;
    }
    
    if (!comment.trim()) {
      toast.error("O comentário não pode estar vazio.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Preparar dados do comentário
      const commentData: any = {
        tool_id: toolId,
        user_id: user.id,
        content: comment.trim(),
        parent_id: replyTo ? replyTo.id : null
      };
      
      // Inserir comentário
      const { data, error } = await supabase
        .from('tool_comments')
        .insert(commentData)
        .select('*');
        
      if (error) throw error;
      
      toast.success(replyTo ? "Resposta adicionada com sucesso!" : "Comentário adicionado com sucesso!");
      setComment('');
      setReplyTo(null);
      refetch();
      
    } catch (error: any) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error(`Erro ao adicionar comentário: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Iniciar resposta a um comentário
  const startReply = (comment: Comment) => {
    setReplyTo(comment);
    // Focar no campo de comentário
    document.getElementById('comment-input')?.focus();
  };

  // Cancelar resposta
  const cancelReply = () => {
    setReplyTo(null);
  };

  // Curtir um comentário
  const likeComment = async (commentId: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para curtir comentários.");
      return;
    }
    
    try {
      // Verificar se já curtiu
      const { data: existingLike, error: checkError } = await supabase
        .from('tool_comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 é o erro "não encontrado"
        throw checkError;
      }
      
      if (existingLike) {
        // Remover curtida
        const { error: removeError } = await supabase
          .from('tool_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
          
        if (removeError) throw removeError;
        
        // Decrementar contador de curtidas
        const { error: updateError } = await supabase
          .from('tool_comments')
          .update({ likes_count: supabase.rpc('decrement', { row_id: commentId, table: 'tool_comments', column: 'likes_count' }) })
          .eq('id', commentId);
          
        if (updateError) throw updateError;
        
        toast.success("Curtida removida");
      } else {
        // Adicionar curtida
        const { error: addError } = await supabase
          .from('tool_comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
          
        if (addError) throw addError;
        
        // Incrementar contador de curtidas
        const { error: updateError } = await supabase
          .from('tool_comments')
          .update({ likes_count: supabase.rpc('increment', { row_id: commentId, table: 'tool_comments', column: 'likes_count' }) })
          .eq('id', commentId);
          
        if (updateError) throw updateError;
        
        toast.success("Comentário curtido");
      }
      
      // Recarregar comentários
      refetch();
      
    } catch (error: any) {
      console.error('Erro ao curtir comentário:', error);
      toast.error(`Erro ao processar curtida: ${error.message}`);
    }
  };

  // Excluir um comentário (apenas para admins ou autor)
  const deleteComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      // Verificar se é admin ou autor do comentário
      const { data: comment, error: fetchError } = await supabase
        .from('tool_comments')
        .select('user_id')
        .eq('id', commentId)
        .single();
        
      if (fetchError) throw fetchError;
      
      const isAuthor = comment.user_id === user.id;
      
      // Verificar se é admin
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      const isAdmin = userProfile.role === 'admin';
      
      if (!isAuthor && !isAdmin) {
        toast.error("Você não tem permissão para excluir este comentário.");
        return;
      }
      
      // Excluir o comentário
      const { error: deleteError } = await supabase
        .from('tool_comments')
        .delete()
        .eq('id', commentId);
        
      if (deleteError) throw deleteError;
      
      toast.success("Comentário excluído com sucesso!");
      refetch();
      
    } catch (error: any) {
      console.error('Erro ao excluir comentário:', error);
      toast.error(`Erro ao excluir comentário: ${error.message}`);
    }
  };

  return {
    comments,
    isLoading,
    error,
    comment,
    setComment,
    replyTo,
    isSubmitting,
    handleSubmitComment,
    startReply,
    cancelReply,
    likeComment,
    deleteComment
  };
};
