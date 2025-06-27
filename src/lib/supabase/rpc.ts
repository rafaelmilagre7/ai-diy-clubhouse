
import { supabase } from './client';
import { UserProfile } from './types';

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
      .eq('topic_id', topicId as any);
      
    if (postsError) {
      console.error("Erro ao excluir posts do tópico:", postsError);
      return { success: false, error: postsError.message };
    }
    
    // Depois exclui o tópico
    const { error: topicError } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', topicId as any);
      
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
      .eq('id', postId as any)
      .single();
      
    // Excluir o post
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId as any);
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Se o post era uma solução, atualizar o tópico
    if ((postData as any)?.is_solution) {
      await supabase
        .from('forum_topics')
        .update({ is_solved: false } as any)
        .eq('id', (postData as any).topic_id as any);
    }
    
    // Decrementar contagem de respostas no tópico
    if ((postData as any)?.topic_id) {
      const { data } = await supabase
        .from('forum_topics')
        .select('reply_count')
        .eq('id', (postData as any).topic_id as any)
        .single();
        
      if ((data as any) && (data as any).reply_count > 0) {
        await supabase
          .from('forum_topics')
          .update({ reply_count: (data as any).reply_count - 1 } as any)
          .eq('id', (postData as any).topic_id as any);
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao excluir post:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtém o nome do papel do usuário a partir do perfil
 */
export function getUserRoleName(profile: UserProfile): string {
  if (!profile) return '';
  
  // Verificar se existe user_roles e tem name
  if (profile.user_roles && typeof profile.user_roles === 'object' && 'name' in profile.user_roles) {
    return (profile.user_roles as any).name || '';
  }
  
  // Fallback para role direto no profile (se existir)
  if (profile.role) {
    return profile.role;
  }
  
  return '';
}
