
import { supabase } from './client';

/**
 * Funções RPC do Supabase
 */

export const createStoragePublicPolicy = async (bucketName: string) => {
  return await supabase.rpc('create_storage_public_policy', {
    bucket_name: bucketName
  });
};

export const incrementTopicReplies = async (topicId: string) => {
  return await supabase.rpc('increment_topic_replies', {
    topic_id: topicId
  });
};

export const completeInviteRegistration = async (inviteToken: string, userData: any) => {
  return await supabase.rpc('complete_invite_registration', {
    invite_token: inviteToken,
    user_data: userData
  });
};

export const auditRoleAssignments = async (userId: string, action: string, details?: any) => {
  return await supabase.rpc('audit_role_assignments', {
    user_id: userId,
    action: action,
    details: details || {}
  });
};

// Helper function to call any RPC function with proper error handling
export const callSupabaseRpc = async (functionName: string, params: Record<string, any> = {}) => {
  try {
    const { data, error } = await supabase.rpc(functionName as any, params);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error calling RPC function ${functionName}:`, error);
    throw error;
  }
};
