
import { supabase } from './client';

/**
 * Cria uma política de acesso público para um bucket de armazenamento
 * @param bucketName Nome do bucket a ser configurado
 */
export async function createStoragePublicPolicy(bucketName: string): Promise<{
  success: boolean;
  error?: string;
}> {
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
 * Incrementa o contador de visualizações de um tópico
 * @param topicId ID do tópico a ser incrementado
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
 * @param topicId ID do tópico a ser incrementado
 */
export async function incrementTopicReplies(topicId: string): Promise<void> {
  try {
    await supabase.rpc('increment', { 
      row_id: topicId, 
      table_name: 'forum_topics', 
      column_name: 'reply_count' 
    });
  } catch (error) {
    console.error('Erro ao incrementar respostas do tópico:', error);
  }
}

/**
 * Deleta um tópico e suas respostas associadas
 * @param topicId ID do tópico a ser deletado
 */
export async function deleteForumTopic(topicId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Primeiro, deletar todos os posts relacionados ao tópico
    const { error: postsError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('topic_id', topicId);

    if (postsError) {
      console.error('Erro ao excluir posts do tópico:', postsError);
      return { success: false, error: postsError.message };
    }

    // Em seguida, deletar o tópico
    const { error: topicError } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', topicId);

    if (topicError) {
      console.error('Erro ao excluir tópico:', topicError);
      return { success: false, error: topicError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir tópico:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Deleta um comentário/post específico
 * @param postId ID do post a ser deletado
 * @param topicId ID do tópico associado (para decrementar contadores)
 */
export async function deleteForumPost(postId: string, topicId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Excluir o post
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Erro ao excluir post:', error);
      return { success: false, error: error.message };
    }

    // Decrementar o contador de respostas do tópico
    try {
      await supabase.rpc('decrement', {
        row_id: topicId,
        table_name: 'forum_topics',
        column_name: 'reply_count'
      });
    } catch (error) {
      // Não falhar a operação principal se essa parte falhar
      console.error('Erro ao decrementar contador de respostas:', error);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir post:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Marca um tópico como resolvido ou não resolvido
 * @param topicId ID do tópico a ser atualizado
 * @param solved Status de resolução (true = resolvido, false = não resolvido)
 * @param solutionPostId ID opcional do post que contém a solução
 */
export async function markTopicAsSolved(
  topicId: string, 
  solved: boolean, 
  solutionPostId?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Atualizar status do tópico
    const { error: topicError } = await supabase
      .from('forum_topics')
      .update({ is_solved: solved })
      .eq('id', topicId);

    if (topicError) {
      console.error('Erro ao marcar tópico como resolvido:', topicError);
      return { success: false, error: topicError.message };
    }

    // Se um post de solução foi especificado, marcá-lo como solução
    if (solved && solutionPostId) {
      // Primeiro reseta qualquer post que estivesse marcado como solução 
      const { error: resetError } = await supabase
        .from('forum_posts')
        .update({ is_solution: false })
        .eq('topic_id', topicId)
        .eq('is_solution', true);
      
      if (resetError) {
        console.error('Erro ao redefinir posts de solução:', resetError);
        // Não falhar completamente por causa disso
      }

      // Marcar o post específico como solução
      const { error: postError } = await supabase
        .from('forum_posts')
        .update({ is_solution: true })
        .eq('id', solutionPostId);

      if (postError) {
        console.error('Erro ao marcar post como solução:', postError);
        return { success: false, error: postError.message };
      }
    } else if (!solved) {
      // Se marcando como não resolvido, limpar qualquer post marcado como solução
      const { error: resetError } = await supabase
        .from('forum_posts')
        .update({ is_solution: false })
        .eq('topic_id', topicId)
        .eq('is_solution', true);
      
      if (resetError) {
        console.error('Erro ao redefinir posts de solução:', resetError);
        // Não falhar completamente por causa disso
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao marcar tópico como resolvido:', error);
    return { success: false, error: error.message };
  }
}
