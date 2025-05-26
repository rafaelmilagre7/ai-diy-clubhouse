
import { supabase } from '@/lib/supabase';

export const incrementTopicViews = async (topicId: string) => {
  const { data, error } = await supabase.rpc('increment_topic_views', {
    topic_id: topicId
  });
  
  if (error) {
    console.error('Erro ao incrementar visualizações:', error);
    throw error;
  }
  
  return data;
};

export const incrementTopicReplies = async (topicId: string) => {
  const { data, error } = await supabase.rpc('increment_topic_replies', {
    topic_id: topicId
  });
  
  if (error) {
    console.error('Erro ao incrementar respostas:', error);
    throw error;
  }
  
  return data;
};

export const deleteForumPost = async (postId: string, topicId: string) => {
  try {
    // Primeiro deletar o post
    const { error: deleteError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId);
      
    if (deleteError) throw deleteError;
    
    // Depois decrementar o contador de respostas
    const { error: decrementError } = await supabase.rpc('decrement_topic_replies', {
      topic_id: topicId
    });
    
    if (decrementError) throw decrementError;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Erro ao deletar post:', error);
    return { success: false, error: error.message };
  }
};
