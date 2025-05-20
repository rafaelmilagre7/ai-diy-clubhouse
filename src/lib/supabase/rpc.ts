
import { supabase } from "./index";

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
