
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

export const auditRoleAssignments = async (userId: string, action: string, details?: any) => {
  return await supabase.rpc('audit_role_assignments', {
    user_id: userId,
    action: action,
    details: details || {}
  });
};

// Helper function to call RPC functions correctly
export const callRpcFunction = async (
  functionName: 'create_storage_public_policy' | 'increment_topic_replies' | 'increment_topic_views' | 'delete_forum_topic' | 'delete_forum_post' | 'audit_role_assignments', 
  params: any = {}
) => {
  return await supabase.rpc(functionName as any, params);
};

// For backward compatibility, create a more flexible version that handles other RPC calls
export const callSupabaseRpc = async (functionName: string, params: any = {}) => {
  try {
    return await supabase.rpc(functionName as any, params);
  } catch (error) {
    console.error(`Error calling RPC function ${functionName}:`, error);
    throw error;
  }
};
