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
          try {
            console.log('📢 Criando notificação de like...', { postId, authorId, userId: user.id });
            
            // Buscar informações do usuário que curtiu
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', user.id)
              .single();

            if (profileError) {
              console.error('⚠️ Erro ao buscar perfil para notificação:', profileError);
            }

            // Buscar informações do post para contexto
            const { data: postData, error: postError } = await supabase
              .from('community_posts')
              .select('content, topic_id')
              .eq('id', postId)
              .single();

            if (postError) {
              console.error('⚠️ Erro ao buscar post para notificação:', postError);
              // Fallback: criar notificação básica usando topicId disponível
              const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                  user_id: authorId,
                  actor_id: user.id,
                  type: 'community_post_liked',
                  title: `${profile?.name || 'Alguém'} curtiu sua resposta`,
                  message: 'Veja a resposta curtida no tópico',
                  action_url: `/comunidade/topico/${topicId}#post-${postId}`,
                  reference_id: postId,
                  reference_type: 'community_post',
                  category: 'community',
                  priority: 1
                });
              
              if (notifError) {
                console.error('❌ Erro ao criar notificação fallback:', notifError);
              } else {
                console.log('✅ Notificação fallback criada com sucesso');
              }
              return;
            }

            // Criar notificação com dados completos
            if (postData) {
              const contentPreview = postData.content.substring(0, 100);
              
              const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                  user_id: authorId,
                  actor_id: user.id,
                  type: 'community_post_liked',
                  title: `${profile?.name || 'Alguém'} curtiu sua resposta`,
                  message: `"${contentPreview}${postData.content.length > 100 ? '...' : ''}"`,
                  action_url: `/comunidade/topico/${postData.topic_id}#post-${postId}`,
                  reference_id: postId,
                  reference_type: 'community_post',
                  category: 'community',
                  priority: 1
                });
              
              if (notifError) {
                console.error('❌ Erro ao criar notificação:', notifError);
              } else {
                console.log('✅ Notificação criada com sucesso');
              }
            }
          } catch (notifError) {
            // NÃO bloquear o like se a notificação falhar
            console.error('❌ Erro no sistema de notificações:', notifError);
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
