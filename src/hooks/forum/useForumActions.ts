
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { ForumTopic, ForumPost, ReactionType } from '@/lib/supabase/types/forum.types';
import { useAuth } from '@/contexts/auth';

export function useForumActions() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  // Criar um novo tópico
  const createTopic = useMutation({
    mutationFn: async ({ 
      title, 
      content, 
      categoryId 
    }: { 
      title: string; 
      content: string; 
      categoryId: string 
    }): Promise<ForumTopic> => {
      if (!profile?.id) throw new Error('Usuário não autenticado');

      const newTopic = {
        title,
        content,
        category_id: categoryId,
        user_id: profile.id
      };

      const { data, error } = await supabase
        .from('forum_topics')
        .insert(newTopic)
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao criar tópico:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'topics'] });
      toast({
        title: 'Tópico criado',
        description: 'Seu tópico foi publicado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar tópico',
        description: error.message || 'Ocorreu um erro ao criar o tópico. Tente novamente.',
        variant: 'destructive'
      });
    }
  });

  // Criar uma nova resposta
  const createPost = useMutation({
    mutationFn: async ({ 
      content, 
      topicId, 
      parentId 
    }: { 
      content: string; 
      topicId: string; 
      parentId?: string 
    }): Promise<ForumPost> => {
      if (!profile?.id) throw new Error('Usuário não autenticado');

      const newPost = {
        content,
        topic_id: topicId,
        parent_id: parentId || null,
        user_id: profile.id
      };

      const { data, error } = await supabase
        .from('forum_posts')
        .insert(newPost)
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao criar resposta:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'posts', variables.topicId] });
      toast({
        title: 'Resposta publicada',
        description: 'Sua resposta foi publicada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao publicar resposta',
        description: error.message || 'Ocorreu um erro ao publicar sua resposta. Tente novamente.',
        variant: 'destructive'
      });
    }
  });

  // Marcar resposta como solução
  const markAsSolution = useMutation({
    mutationFn: async ({ 
      postId, 
      topicId, 
      isSolution 
    }: { 
      postId: string; 
      topicId: string; 
      isSolution: boolean 
    }) => {
      const { error } = await supabase
        .from('forum_posts')
        .update({ is_solution: isSolution })
        .eq('id', postId);

      if (error) {
        console.error('Erro ao marcar como solução:', error);
        throw error;
      }

      return { postId, isSolution };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'posts', variables.topicId] });
      toast({
        title: variables.isSolution ? 'Marcado como solução' : 'Desmarcado como solução',
        description: variables.isSolution 
          ? 'A resposta foi marcada como solução.' 
          : 'A resposta foi desmarcada como solução.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao atualizar resposta',
        description: 'Ocorreu um erro ao marcar/desmarcar a resposta como solução.',
        variant: 'destructive'
      });
    }
  });

  // Adicionar/remover reação
  const toggleReaction = useMutation({
    mutationFn: async ({ 
      postId, 
      reactionType, 
      active 
    }: { 
      postId: string; 
      reactionType: ReactionType; 
      active: boolean 
    }) => {
      if (!profile?.id) throw new Error('Usuário não autenticado');

      if (active) {
        // Adicionar reação
        const { error } = await supabase
          .from('forum_reactions')
          .insert({
            post_id: postId,
            user_id: profile.id,
            reaction_type: reactionType
          });

        if (error) {
          // Se já existe, não é um erro
          if (error.code === '23505') { // Código para violação de unicidade
            return { postId, reactionType, active };
          }
          console.error('Erro ao adicionar reação:', error);
          throw error;
        }
      } else {
        // Remover reação
        const { error } = await supabase
          .from('forum_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', profile.id)
          .eq('reaction_type', reactionType);

        if (error) {
          console.error('Erro ao remover reação:', error);
          throw error;
        }
      }

      return { postId, reactionType, active };
    },
    onSuccess: () => {
      // Revalidar as consultas de posts para atualizar as contagens de reação
      queryClient.invalidateQueries({ queryKey: ['forum', 'posts'] });
    },
    onError: () => {
      toast({
        title: 'Erro ao registrar reação',
        description: 'Ocorreu um erro ao processar sua reação.',
        variant: 'destructive'
      });
    }
  });

  return {
    createTopic,
    createPost,
    markAsSolution,
    toggleReaction
  };
}
