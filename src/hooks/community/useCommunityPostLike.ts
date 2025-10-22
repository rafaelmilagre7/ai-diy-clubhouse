import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useCommunityPostLike = (topicId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const likePost = async (
    postId: string,
    authorId: string,
    currentLiked: boolean,
    currentCount: number
  ) => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir respostas');
      return;
    }

    // Prevenir múltiplos cliques
    if (processingIds.has(postId)) return;

    setProcessingIds(prev => new Set(prev).add(postId));

    // 🎯 UPDATE OTIMISTA - Atualização instantânea da UI
    const queryKey = ['community-posts', topicId, user.id];
    
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData) return oldData;
      return oldData.map((post: any) => {
        if (post.id === postId) {
          return {
            ...post,
            user_has_liked: !currentLiked,
            likes_count: currentLiked ? Math.max(0, currentCount - 1) : currentCount + 1
          };
        }
        return post;
      });
    });

    try {
      if (currentLiked) {
        // ❌ Remover curtida
        const { error: deleteError } = await supabase
          .from('community_reactions')
          .delete()
          .match({ user_id: user.id, post_id: postId, reaction_type: 'like' });

        if (deleteError) throw deleteError;

      } else {
        // ✅ Adicionar curtida
        const { error: insertError } = await supabase
          .from('community_reactions')
          .insert({ user_id: user.id, post_id: postId, reaction_type: 'like' });

        if (insertError) throw insertError;

        // 📢 Criar notificação para o autor (se não for o próprio usuário)
        if (authorId !== user.id) {
          // Buscar informações do usuário que curtiu
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();

          // Buscar informações do post para contexto
          const { data: postData } = await supabase
            .from('community_posts')
            .select('content, topic_id')
            .eq('id', postId)
            .single();

          if (postData) {
            const contentPreview = postData.content.substring(0, 100);
            
            await supabase
              .from('notifications')
              .insert({
                user_id: authorId,
                type: 'community_post_liked',
                title: `${profile?.name || 'Alguém'} curtiu sua resposta`,
                message: `"${contentPreview}${postData.content.length > 100 ? '...' : ''}"`,
                action_url: `/comunidade/topico/${postData.topic_id}#post-${postId}`,
                category: 'community',
                priority: 1
              });
          }
        }
      }

      // ✅ Sucesso - invalidar query para sincronizar com o servidor
      queryClient.invalidateQueries({ queryKey });

    } catch (error: any) {
      // 🔄 ROLLBACK - Reverter para o estado anterior
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((post: any) => {
          if (post.id === postId) {
            return { ...post, user_has_liked: currentLiked, likes_count: currentCount };
          }
          return post;
        });
      });

      console.error('Erro ao processar curtida:', error);
      
      toast.error('Não foi possível processar sua curtida', {
        action: {
          label: 'Tentar novamente',
          onClick: () => likePost(postId, authorId, currentLiked, currentCount)
        }
      });

    } finally {
      // Remover do conjunto de processamento após 500ms
      setTimeout(() => {
        setProcessingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }, 500);
    }
  };

  return { 
    likePost,
    isProcessing: (postId: string) => processingIds.has(postId)
  };
};
