
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
    p_topic_id: topicId
  });
  
  if (error) {
    console.error('Erro ao deletar tópico:', error);
    throw error;
  }
  
  // Verificar se a função retornou sucesso
  if (data && !data.success) {
    throw new Error(data.message || 'Erro ao deletar tópico');
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

export const bulkReactivateExpiredInvites = async (daysExtension: number = 7) => {
  const { data, error } = await supabase.rpc('reactivate_all_expired_invites_secure', {
    p_days_extension: daysExtension
  });
  
  if (error) {
    console.error('Erro ao reativar convites em lote:', error);
    throw error;
  }
  
  return data;
};

export const createInviteHybrid = async (params: {
  email: string;
  roleId: string;
  phone?: string;
  expiresIn?: string;
  notes?: string;
  channelPreference?: string;
}) => {
  const { data, error } = await supabase.rpc('create_invite_hybrid', {
    p_email: params.email,
    p_role_id: params.roleId,
    p_phone: params.phone || null,
    p_expires_in: params.expiresIn || '7 days',
    p_notes: params.notes || null,
    p_channel_preference: params.channelPreference || 'email'
  });
  
  if (error) {
    console.error('Erro ao criar convite híbrido:', error);
    throw error;
  }
  
  return data;
};

export const adminResetUser = async (userEmail: string) => {
  const { data, error } = await supabase.rpc('admin_reset_user', {
    user_email: userEmail
  });
  
  if (error) {
    console.error('Erro no reset administrativo:', error);
    throw error;
  }
  
  return data;
};

export const adminRemoveTeamMember = async (memberId: string, organizationId: string) => {
  const { data, error } = await supabase.rpc('admin_remove_team_member', {
    p_member_id: memberId,
    p_organization_id: organizationId
  });
  
  if (error) {
    console.error('Erro ao remover membro:', error);
    throw error;
  }
  
  return data;
};

export const getChecklistTemplate = async (solutionId: string, checklistType: string = 'implementation') => {
  const { data, error } = await supabase.rpc('get_checklist_template', {
    p_solution_id: solutionId,
    p_checklist_type: checklistType
  });
  
  if (error) {
    console.error('Erro ao buscar template de checklist:', error);
    throw error;
  }
  
  return data;
};

export const completeLessonV2 = async (lessonId: string, progressPercentage: number = 100) => {
  const { data, error } = await supabase.rpc('complete_lesson_v2', {
    p_lesson_id: lessonId,
    p_progress_percentage: progressPercentage,
    p_completed_at: new Date().toISOString()
  });
  
  if (error) {
    console.error('Erro ao concluir aula:', error);
    throw error;
  }
  
  return data;
};
