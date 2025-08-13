
import { supabase } from "./client";

export const incrementTopicViews = async (topicId: string) => {
  const { error } = await supabase.rpc('increment_topic_views', {
    topic_id: topicId
  });
  
  if (error) {
    console.error('Erro ao incrementar visualizações:', error);
    throw error;
  }
};

export const incrementTopicReplies = async (topicId: string) => {
  const { error } = await supabase.rpc('increment_topic_replies', {
    topic_id: topicId
  });
  
  if (error) {
    console.error('Erro ao incrementar respostas:', error);
    throw error;
  }
};

export const deleteCommunityTopic = async (topicId: string) => {
  const { data, error } = await supabase.rpc('delete_community_topic', {
    topic_id: topicId
  });
  
  if (error) {
    console.error('Erro ao deletar tópico:', error);
    throw error;
  }
  
  return data;
};

export const deleteCommunityPost = async (postId: string) => {
  const { data, error } = await supabase.rpc('delete_community_post', {
    post_id: postId
  });
  
  if (error) {
    console.error('Erro ao deletar post:', error);
    throw error;
  }
  
  return data;
};

export const toggleTopicSolved = async (topicId: string, userId?: string) => {
  const { data, error } = await supabase.rpc('toggle_topic_solved', {
    p_topic_id: topicId,
    p_user_id: userId
  });
  
  if (error) {
    console.error('Erro ao alterar status do tópico:', error);
    throw error;
  }
  
  return data;
};

export const createStoragePublicPolicy = async (bucketName: string) => {
  const { data, error } = await supabase.rpc('create_storage_public_policy_v2', {
    bucket_name: bucketName
  });
  
  if (error) {
    console.error('Erro ao criar política de storage:', error);
    throw error;
  }
  
  return data;
};

export const reactivateInvite = async (inviteId: string, daysExtension: number = 7) => {
  const { data, error } = await supabase.rpc('reactivate_invite_secure', {
    p_invite_id: inviteId,
    p_days_extension: daysExtension
  });
  
  if (error) {
    console.error('Erro ao reativar convite:', error);
    throw error;
  }
  
  return data;
};
