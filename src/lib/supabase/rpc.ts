
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
