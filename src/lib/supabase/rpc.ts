
import { supabase } from './client';

export const incrementTopicViews = async (topicId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.rpc('increment_topic_views', { 
      topic_id: topicId 
    });
    
    if (error) {
      console.error('Erro ao incrementar visualizações:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao incrementar visualizações:', error);
    return { success: false, error: error.message };
  }
};

export const incrementTopicReplies = async (topicId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.rpc('increment_topic_replies', { 
      topic_id: topicId 
    });
    
    if (error) {
      console.error('Erro ao incrementar respostas:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao incrementar respostas:', error);
    return { success: false, error: error.message };
  }
};

export const decrementTopicReplies = async (topicId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Usando a função genérica decrement
    const { error } = await supabase.rpc('decrement', {
      row_id: topicId,
      table_name: 'forum_topics',
      column_name: 'reply_count'
    });
    
    if (error) {
      console.error('Erro ao decrementar respostas:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao decrementar respostas:', error);
    return { success: false, error: error.message };
  }
};

export const deleteForumPost = async (postId: string, topicId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('deleteforumpost', {
      post_id: postId
    });
    
    if (error) {
      console.error('Erro ao deletar post:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao deletar post:', error);
    return { success: false, error: error.message };
  }
};

export const deleteForumTopic = async (topicId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Primeiro deletar todos os posts do tópico
    const { error: postsError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('topic_id', topicId);
    
    if (postsError) {
      console.error('Erro ao deletar posts do tópico:', postsError);
      return { success: false, error: postsError.message };
    }
    
    // Depois deletar o tópico
    const { error: topicError } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', topicId);
    
    if (topicError) {
      console.error('Erro ao deletar tópico:', topicError);
      return { success: false, error: topicError.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao deletar tópico:', error);
    return { success: false, error: error.message };
  }
};

export const createStoragePublicPolicy = async (bucketName: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('create_storage_public_policy', {
      bucket_name: bucketName
    });
    
    if (error) {
      console.error('Erro ao criar política de storage:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao criar política de storage:', error);
    return { success: false, error: error.message };
  }
};
