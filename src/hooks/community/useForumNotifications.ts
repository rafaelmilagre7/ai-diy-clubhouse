
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { createForumReplyNotification } from '@/lib/notifications/triggers';

export const useForumNotifications = () => {
  useEffect(() => {
    // Configurar real-time para novas respostas no fórum
    const channel = supabase
      .channel('forum_posts_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_posts',
        },
        async (payload) => {
          const newPost = payload.new as any;
          
          try {
            // Buscar o autor do tópico
            const { data: topic } = await supabase
              .from('forum_topics')
              .select('user_id')
              .eq('id', newPost.topic_id)
              .single();

            if (topic && topic.user_id !== newPost.user_id) {
              // Criar notificação para o autor do tópico
              await createForumReplyNotification(
                newPost.topic_id,
                newPost.id,
                topic.user_id,
                newPost.user_id
              );
            }

            // Se é uma resposta a outro post, notificar o autor do post pai
            if (newPost.parent_id) {
              const { data: parentPost } = await supabase
                .from('forum_posts')
                .select('user_id')
                .eq('id', newPost.parent_id)
                .single();

              if (parentPost && parentPost.user_id !== newPost.user_id) {
                await createForumReplyNotification(
                  newPost.topic_id,
                  newPost.id,
                  parentPost.user_id,
                  newPost.user_id
                );
              }
            }
          } catch (error) {
            console.error('Erro ao processar notificação de resposta do fórum:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
