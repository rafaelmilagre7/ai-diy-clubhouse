
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';
import { ForumTopicWithMeta, ReactionType } from '@/lib/supabase/types/forum.types';

interface CreateTopicParams {
  title: string;
  content: string;
  categoryId: string;
}

interface CreatePostParams {
  topicId: string;
  content: string;
  parentId?: string;
}

export const useForumActions = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  // Criar novo tópico
  const createTopic = async (params: CreateTopicParams) => {
    if (!profile?.id) throw new Error('Usuário não autenticado');
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          title: params.title,
          content: params.content,
          category_id: params.categoryId,
          user_id: profile.id
        })
        .select('*, categories:category_id (slug)')
        .single();
        
      if (error) throw error;
      
      // Invalidar query para recarregar lista de tópicos
      queryClient.invalidateQueries({
        queryKey: ['forum', 'topics']
      });
      
      return data as ForumTopicWithMeta;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Criar nova resposta
  const createPost = async (params: CreatePostParams) => {
    if (!profile?.id) throw new Error('Usuário não autenticado');
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: params.topicId,
          content: params.content,
          user_id: profile.id,
          parent_id: params.parentId || null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ['forum', 'posts', params.topicId]
      });
      
      queryClient.invalidateQueries({
        queryKey: ['forum', 'topic', params.topicId]
      });
      
      return data;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reagir a um post
  const reactToPost = async (postId: string, reactionType: ReactionType) => {
    if (!profile?.id) throw new Error('Usuário não autenticado');
    
    setIsLoading(true);
    try {
      // Verificar se o usuário já reagiu a este post
      const { data: existingReactions } = await supabase
        .from('forum_reactions')
        .select()
        .eq('post_id', postId)
        .eq('user_id', profile.id);
      
      if (existingReactions && existingReactions.length > 0) {
        // Se já existe uma reação, remover
        const { error } = await supabase
          .from('forum_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', profile.id);
          
        if (error) throw error;
      } else {
        // Se não existe reação, criar
        const { error } = await supabase
          .from('forum_reactions')
          .insert({
            post_id: postId,
            user_id: profile.id,
            reaction_type: reactionType
          });
          
        if (error) throw error;
      }
      
      // Buscar o topic_id para invalidar as queries
      const { data: post } = await supabase
        .from('forum_posts')
        .select('topic_id')
        .eq('id', postId)
        .single();
      
      if (post) {
        queryClient.invalidateQueries({
          queryKey: ['forum', 'posts', post.topic_id]
        });
      }
      
      return true;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Marcar post como solução
  const markAsSolution = async (postId: string, topicId: string) => {
    if (!profile?.id) throw new Error('Usuário não autenticado');
    
    setIsLoading(true);
    try {
      // Remover a marcação de solução de todos os posts deste tópico
      await supabase
        .from('forum_posts')
        .update({ is_solution: false })
        .eq('topic_id', topicId);
      
      // Marcar este post específico como solução
      const { error } = await supabase
        .from('forum_posts')
        .update({ is_solution: true })
        .eq('id', postId);
        
      if (error) throw error;
      
      // Invalidar queries
      queryClient.invalidateQueries({
        queryKey: ['forum', 'posts', topicId]
      });
      
      return true;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Excluir post
  const deletePost = async (postId: string) => {
    if (!profile?.id) throw new Error('Usuário não autenticado');
    
    setIsLoading(true);
    try {
      // Buscar o topic_id para invalidar as queries
      const { data: post } = await supabase
        .from('forum_posts')
        .select('topic_id')
        .eq('id', postId)
        .single();
      
      const topicId = post?.topic_id;
      
      // Excluir o post
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);
        
      if (error) throw error;
      
      // Invalidar queries
      if (topicId) {
        queryClient.invalidateQueries({
          queryKey: ['forum', 'posts', topicId]
        });
        
        queryClient.invalidateQueries({
          queryKey: ['forum', 'topic', topicId]
        });
      }
      
      return true;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    createTopic,
    createPost,
    reactToPost,
    markAsSolution,
    deletePost,
    isLoading
  };
};
