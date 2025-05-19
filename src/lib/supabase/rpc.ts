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
 * Cria uma nova indicação
 * @param email Email da pessoa indicada
 * @param type Tipo de indicação: 'club' ou 'formacao'
 * @param notes Observações opcionais
 */
export async function createReferral(email: string, type: 'club' | 'formacao', notes?: string): Promise<{
  success: boolean;
  message?: string;
  referral_id?: string;
  token?: string;
  expires_at?: string;
}> {
  try {
    const { data, error } = await supabase.rpc('create_referral', {
      p_referrer_id: supabase.auth.getUser().then(res => res.data.user?.id),
      p_email: email,
      p_type: type,
      p_notes: notes
    });

    if (error) {
      console.error('Erro ao criar indicação:', error);
      return { success: false, message: error.message };
    }

    return {
      success: data.success,
      message: data.message,
      referral_id: data.referral_id,
      token: data.token,
      expires_at: data.expires_at
    };
  } catch (error: any) {
    console.error('Erro ao criar indicação:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Verifica os detalhes de uma indicação pelo token
 * @param token Token de indicação
 */
export async function checkReferral(token: string): Promise<{
  success: boolean;
  message?: string;
  referral_id?: string;
  type?: string;
  referrer_name?: string;
  status?: string;
  expires_at?: string;
}> {
  try {
    const { data, error } = await supabase.rpc('check_referral', {
      p_token: token
    });

    if (error) {
      console.error('Erro ao verificar indicação:', error);
      return { success: false, message: error.message };
    }

    return {
      success: data.success,
      message: data.message,
      referral_id: data.referral_id,
      type: data.type,
      referrer_name: data.referrer_name,
      status: data.status,
      expires_at: data.expires_at
    };
  } catch (error: any) {
    console.error('Erro ao verificar indicação:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Processa uma indicação para um usuário recém-registrado
 * @param token Token de indicação
 * @param userId ID do usuário
 */
export async function processReferral(token: string, userId: string): Promise<{
  success: boolean;
  message?: string;
  referral_id?: string;
  type?: string;
  referrer_id?: string;
}> {
  try {
    const { data, error } = await supabase.rpc('process_referral', {
      p_token: token,
      p_user_id: userId
    });

    if (error) {
      console.error('Erro ao processar indicação:', error);
      return { success: false, message: error.message };
    }

    return {
      success: data.success,
      message: data.message,
      referral_id: data.referral_id,
      type: data.type,
      referrer_id: data.referrer_id
    };
  } catch (error: any) {
    console.error('Erro ao processar indicação:', error);
    return { success: false, message: error.message };
  }
}
