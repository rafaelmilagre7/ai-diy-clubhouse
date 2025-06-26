
import { supabase } from './client';

/**
 * Funções RPC do Supabase
 */

export const createStoragePublicPolicy = async (bucketName: string) => {
  return await supabase.rpc('create_storage_public_policy', {
    bucket_name: bucketName
  });
};

export const incrementTopicViews = async (topicId: string) => {
  return await supabase.rpc('increment_topic_views', {
    topic_id: topicId
  });
};

export const incrementTopicReplies = async (topicId: string) => {
  return await supabase.rpc('increment_topic_replies', {
    topic_id: topicId
  });
};

// Helper function to call RPC functions correctly
export const callRpcFunction = async (functionName: string, params: any = {}) => {
  return await supabase.rpc(functionName as any, params);
};

export const deleteForumTopic = async (topicId: string) => {
  return await supabase.rpc('delete_forum_topic', {
    topic_id: topicId
  });
};

export const deleteForumPost = async (postId: string) => {
  return await supabase.rpc('delete_forum_post', {
    post_id: postId
  });
};
