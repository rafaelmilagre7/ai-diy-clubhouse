
import { supabase } from './client';

/**
 * Cria uma política pública para um bucket de armazenamento
 */
export async function createStoragePublicPolicy(bucketName: string): Promise<{ success: boolean, error?: string }> {
  try {
    const { data, error } = await supabase.rpc('create_storage_public_policy', {
      bucket_name: bucketName
    });
    
    if (error) {
      console.error(`Erro ao criar políticas para ${bucketName}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error(`Erro ao criar políticas para ${bucketName}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Incrementa as visualizações de um tópico
 */
export async function incrementTopicViews(topicId: string): Promise<void> {
  try {
    await supabase.rpc('increment_topic_views', { topic_id: topicId });
  } catch (error) {
    console.error('Erro ao incrementar visualizações do tópico:', error);
  }
}

/**
 * Incrementa o contador de respostas de um tópico
 */
export async function incrementTopicReplies(topicId: string): Promise<void> {
  try {
    await supabase.rpc('increment_topic_replies', { topic_id: topicId });
  } catch (error) {
    console.error('Erro ao incrementar respostas do tópico:', error);
  }
}

/**
 * Deleta um tópico da comunidade
 */
export async function deleteCommunityTopic(topicId: string): Promise<{ success: boolean, error?: string }> {
  try {
    const { data, error } = await supabase.rpc('delete_forum_topic', {
      topic_id: topicId
    });

    if (error) {
      console.error('Erro ao deletar tópico:', error);
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || 'Erro ao deletar tópico' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao deletar tópico:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Deleta um post da comunidade
 */
export async function deleteCommunityPost(postId: string): Promise<{ success: boolean, error?: string }> {
  try {
    const { data, error } = await supabase.rpc('delete_forum_post', {
      post_id: postId
    });

    if (error) {
      console.error('Erro ao deletar post:', error);
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || 'Erro ao deletar post' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao deletar post:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Manter aliases para compatibilidade com código existente
export const deleteForumTopic = deleteCommunityTopic;
export const deleteForumPost = deleteCommunityPost;
