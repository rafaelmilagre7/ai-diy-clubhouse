
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
 * Deleta um tópico do fórum
 */
export async function deleteForumTopic(topicId: string): Promise<{ success: boolean, error?: string }> {
  try {
    // Primeiro exclui todos os posts associados ao tópico
    const { error: postsError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('topic_id', topicId);
      
    if (postsError) {
      console.error("Erro ao excluir posts do tópico:", postsError);
      return { success: false, error: postsError.message };
    }
    
    // Depois exclui o tópico
    const { error: topicError } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', topicId);
      
    if (topicError) {
      console.error("Erro ao excluir tópico:", topicError);
      return { success: false, error: topicError.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao excluir tópico:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Deleta um post do fórum
 */
export async function deleteForumPost(postId: string): Promise<{ success: boolean, error?: string }> {
  try {
    // Verificar se o post é uma solução marcada
    const { data: postData } = await supabase
      .from('forum_posts')
      .select('topic_id, is_solution')
      .eq('id', postId)
      .single();
      
    // Excluir o post
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId);
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Se o post era uma solução, atualizar o tópico
    if (postData?.is_solution) {
      await supabase
        .from('forum_topics')
        .update({ is_solved: false })
        .eq('id', postData.topic_id);
    }
    
    // Decrementar contagem de respostas no tópico
    if (postData?.topic_id) {
      const { data } = await supabase
        .from('forum_topics')
        .select('reply_count')
        .eq('id', postData.topic_id)
        .single();
        
      if (data && data.reply_count > 0) {
        await supabase
          .from('forum_topics')
          .update({ reply_count: data.reply_count - 1 })
          .eq('id', postData.topic_id);
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao excluir post:", error);
    return { success: false, error: error.message };
  }
}
