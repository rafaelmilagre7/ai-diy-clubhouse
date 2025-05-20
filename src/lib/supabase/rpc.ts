
/**
 * Módulo para funções de RPC do Supabase
 */

import { supabase } from "./client";

/**
 * Cria uma política pública para um bucket de armazenamento
 */
export async function createStoragePublicPolicy(bucketName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('create_storage_public_policy', {
      bucket_name: bucketName
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Incrementa o contador de visualizações de um tópico
 */
export async function incrementTopicViews(topicId: string): Promise<void> {
  try {
    await supabase.rpc('increment_topic_views', { topic_id: topicId });
  } catch (error) {
    console.error("Erro ao incrementar visualizações:", error);
  }
}

/**
 * Incrementa o contador de respostas de um tópico
 */
export async function incrementTopicReplies(topicId: string): Promise<void> {
  try {
    await supabase.rpc('increment_topic_replies', { topic_id: topicId });
  } catch (error) {
    console.error("Erro ao incrementar respostas:", error);
  }
}

/**
 * Exclui um tópico do fórum e suas postagens
 */
export async function deleteForumTopic(topicId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Primeiro exclui todas as postagens relacionadas
    const { error: postsError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('topic_id', topicId);
      
    if (postsError) throw postsError;
    
    // Depois exclui o tópico
    const { error: topicError } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', topicId);
      
    if (topicError) throw topicError;
    
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao excluir tópico:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Exclui uma postagem do fórum
 */
export async function deleteForumPost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Exclui todas as respostas desta postagem primeiro
    const { error: repliesError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('parent_id', postId);
      
    if (repliesError) throw repliesError;
    
    // Depois exclui a postagem em si
    const { error: postError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId);
      
    if (postError) throw postError;
    
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao excluir postagem:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Marca um tópico como resolvido
 */
export async function markTopicAsSolved(
  topicId: string, 
  isSolved: boolean, 
  solutionPostId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Primeiro, atualiza o tópico
    const { error: topicError } = await supabase
      .from('forum_topics')
      .update({ is_solved: isSolved })
      .eq('id', topicId);
      
    if (topicError) throw topicError;
    
    // Se for para marcar como resolvido e tiver um ID de post de solução
    if (isSolved && solutionPostId) {
      // Primeiro, desmarca qualquer post que esteja marcado como solução
      const { error: resetError } = await supabase
        .from('forum_posts')
        .update({ is_solution: false })
        .eq('topic_id', topicId)
        .eq('is_solution', true);
        
      if (resetError) throw resetError;
      
      // Agora marca o post específico como solução
      const { error: markError } = await supabase
        .from('forum_posts')
        .update({ is_solution: true })
        .eq('id', solutionPostId);
        
      if (markError) throw markError;
    } 
    // Se for para desmarcar como resolvido
    else if (!isSolved) {
      // Desmarca todos os posts de solução deste tópico
      const { error: resetError } = await supabase
        .from('forum_posts')
        .update({ is_solution: false })
        .eq('topic_id', topicId)
        .eq('is_solution', true);
        
      if (resetError) throw resetError;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar estado de solução do tópico:", error);
    return { success: false, error: error.message };
  }
}
