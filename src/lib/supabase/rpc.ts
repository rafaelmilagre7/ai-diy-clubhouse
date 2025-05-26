
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

export const decrementTopicReplies = async (topicId: string) => {
  const { data, error } = await supabase.rpc('decrement_topic_replies', {
    topic_id: topicId
  });
  
  if (error) {
    console.error('Erro ao decrementar respostas:', error);
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
    const { error: decrementError } = await decrementTopicReplies(topicId);
    
    if (decrementError) throw decrementError;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Erro ao deletar post:', error);
    return { success: false, error: error.message };
  }
};

export const deleteForumTopic = async (topicId: string) => {
  try {
    // Primeiro deletar todos os posts do tópico
    const { error: postsError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('topic_id', topicId);
      
    if (postsError) throw postsError;
    
    // Depois deletar o tópico
    const { error: topicError } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', topicId);
      
    if (topicError) throw topicError;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Erro ao deletar tópico:', error);
    return { success: false, error: error.message };
  }
};

export const createStoragePublicPolicy = async (bucketName: string) => {
  try {
    // Verificar se o bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erro ao listar buckets:', listError);
      return { success: false, error: listError.message };
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Criar o bucket se não existir
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/*', 'video/*', 'application/pdf', 'text/*'],
        fileSizeLimit: 50 * 1024 * 1024 // 50MB
      });
      
      if (createError) {
        console.error('Erro ao criar bucket:', createError);
        return { success: false, error: createError.message };
      }
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Erro ao configurar storage:', error);
    return { success: false, error: error.message };
  }
};
