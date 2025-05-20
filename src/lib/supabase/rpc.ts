
import { supabase } from "./client";

/**
 * Incrementa o contador de visualizações de um tópico
 */
export const incrementTopicViews = async (topicId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_topic_views', {
      topic_id: topicId
    });

    if (error) {
      console.error('Erro ao incrementar visualizações:', error);
      throw error;
    }
  } catch (error) {
    console.error('Falha ao chamar RPC incrementar visualizações:', error);
    // Fallback: Se o RPC falhar, tente uma abordagem direta
    try {
      const { data } = await supabase
        .from('forum_topics')
        .select('view_count')
        .eq('id', topicId)
        .single();

      if (data) {
        const currentCount = data.view_count || 0;
        await supabase
          .from('forum_topics')
          .update({ view_count: currentCount + 1 })
          .eq('id', topicId);
      }
    } catch (fallbackError) {
      console.error('Também falhou o fallback de incrementar visualizações:', fallbackError);
    }
  }
};

/**
 * Incrementa o contador de respostas de um tópico
 */
export const incrementTopicReplies = async (topicId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_topic_replies', {
      topic_id: topicId
    });

    if (error) {
      console.error('Erro ao incrementar respostas:', error);
      throw error;
    }
  } catch (error) {
    console.error('Falha ao chamar RPC incrementar respostas:', error);
    // Fallback: Se o RPC falhar, tente uma abordagem direta
    try {
      const { data } = await supabase
        .from('forum_topics')
        .select('reply_count')
        .eq('id', topicId)
        .single();

      if (data) {
        const currentCount = data.reply_count || 0;
        await supabase
          .from('forum_topics')
          .update({ 
            reply_count: currentCount + 1,
            last_activity_at: new Date().toISOString()
          })
          .eq('id', topicId);
      }
    } catch (fallbackError) {
      console.error('Também falhou o fallback de incrementar respostas:', fallbackError);
    }
  }
};

/**
 * Cria políticas de acesso público para um bucket de storage
 */
export const createStoragePublicPolicy = async (bucketName: string): Promise<{success: boolean, error?: string}> => {
  try {
    const { data, error } = await supabase.rpc('create_storage_public_policy', {
      bucket_name: bucketName
    });

    if (error) {
      console.error('Erro ao criar política de acesso público:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Falha ao criar política de acesso público:', error);
    return { success: false, error: error.message || 'Erro desconhecido' };
  }
};

/**
 * Exclui um tópico do fórum
 */
export const deleteForumTopic = async (topicId: string): Promise<{success: boolean, error?: string}> => {
  try {
    // Primeiro excluir todas as respostas relacionadas
    const { error: postsError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('topic_id', topicId);

    if (postsError) {
      console.error('Erro ao excluir respostas do tópico:', postsError);
      return { success: false, error: postsError.message };
    }

    // Em seguida, excluir o tópico
    const { error } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', topicId);

    if (error) {
      console.error('Erro ao excluir tópico:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Falha ao excluir tópico:', error);
    return { success: false, error: error.message || 'Erro desconhecido' };
  }
};

/**
 * Exclui uma postagem do fórum
 */
export const deleteForumPost = async (postId: string): Promise<{success: boolean, error?: string}> => {
  try {
    // Primeiro obter o post para verificar se é uma resposta
    const { data: post, error: fetchError } = await supabase
      .from('forum_posts')
      .select('topic_id')
      .eq('id', postId)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar post:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // Excluir o post
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Erro ao excluir post:', error);
      return { success: false, error: error.message };
    }

    // Atualizar a contagem de respostas do tópico
    if (post && post.topic_id) {
      try {
        const { data } = await supabase
          .from('forum_topics')
          .select('reply_count')
          .eq('id', post.topic_id)
          .single();

        if (data && data.reply_count > 0) {
          await supabase
            .from('forum_topics')
            .update({ reply_count: data.reply_count - 1 })
            .eq('id', post.topic_id);
        }
      } catch (updateError) {
        console.error('Erro ao atualizar contagem de respostas:', updateError);
        // Não falhar a função principal se esta atualização falhar
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Falha ao excluir post:', error);
    return { success: false, error: error.message || 'Erro desconhecido' };
  }
};
