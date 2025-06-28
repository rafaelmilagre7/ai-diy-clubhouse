import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles:user_roles(
          id,
          name,
          description
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }

    // Convert to UserProfile with proper type handling and all required fields
    return {
      id: data.id,
      email: data.email || '',
      name: data.name || '',
      avatar_url: data.avatar_url,
      company_name: data.company_name,
      industry: data.industry,
      role_id: data.role_id,
      role: data.role || 'member',
      created_at: data.created_at,
      updated_at: data.updated_at,
      onboarding_completed: data.onboarding_completed || false,
      onboarding_completed_at: data.onboarding_completed_at,
      
      // Required fields with defaults
      birth_date: data.birth_date || null,
      curiosity: data.curiosity || null,
      business_sector: data.business_sector || null,
      position: data.position || null,
      company_size: data.company_size || null,
      annual_revenue: data.annual_revenue || null,
      primary_goal: data.primary_goal || null,
      business_challenges: data.business_challenges || [],
      ai_knowledge_level: data.ai_knowledge_level || null,
      weekly_availability: data.weekly_availability || null,
      networking_interests: data.networking_interests || [],
      nps_score: data.nps_score || null,
      country: data.country || null,
      state: data.state || null,
      city: data.city || null,
      phone: data.phone || null,
      phone_country_code: data.phone_country_code || '+55',
      linkedin: data.linkedin || null,
      instagram: data.instagram || null,
      current_position: data.current_position || null,
      company_website: data.company_website || null,
      accepts_marketing: data.accepts_marketing || null,
      accepts_case_study: data.accepts_case_study || null,
      
      // Additional required fields
      has_implemented_ai: data.has_implemented_ai || null,
      ai_tools_used: data.ai_tools_used || [],
      daily_tools: data.daily_tools || [],
      who_will_implement: data.who_will_implement || null,
      implementation_timeline: data.implementation_timeline || null,
      team_size: data.team_size || null,
      main_challenges: data.main_challenges || [],
      success_metrics: data.success_metrics || [],
      learning_preferences: data.learning_preferences || [],
      time_investment: data.time_investment || null,
      budget_range: data.budget_range || null,
      technical_level: data.technical_level || null,
      support_needs: data.support_needs || [],
      
      user_roles: data.user_roles ? {
        id: data.user_roles.id,
        name: data.user_roles.name,
        description: data.user_roles.description
      } : null
    } as UserProfile;
  } catch (error) {
    console.error('Erro na busca do perfil:', error);
    return null;
  }
};

export const createUserProfileIfNeeded = async (userId: string, userData?: any): Promise<UserProfile | null> => {
  try {
    // Verificar se o perfil já existe
    const existingProfile = await fetchUserProfile(userId);
    if (existingProfile) {
      return existingProfile;
    }

    // Criar novo perfil
    const profileData = {
      id: userId,
      email: userData?.email || '',
      name: userData?.name || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar perfil:', error);
      return null;
    }

    return await fetchUserProfile(userId);
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    return null;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  return await fetchUserProfile(userId);
};

export const createUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const insertData = {
      id: userId,
      email: profileData.email || '',
      name: profileData.name || '',
      avatar_url: profileData.avatar_url,
      company_name: profileData.company_name,
      industry: profileData.industry,
      role_id: profileData.role_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar perfil:', error);
      return null;
    }

    return await fetchUserProfile(userId);
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      return null;
    }

    return await fetchUserProfile(userId);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return null;
  }
};

export const deleteUserProfile = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Erro ao deletar perfil:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao deletar perfil:', error);
    return false;
  }
};

// Função auxiliar para lidar com roles
export const assignRoleToUser = async (userId: string, roleName: string): Promise<boolean> => {
  try {
    // Buscar o role_id baseado no nome
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (roleError || !roleData) {
      console.error('Role não encontrado:', roleName);
      return false;
    }

    // Atualizar o perfil com o novo role_id
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role_id: roleData.id })
      .eq('id', userId);

    if (updateError) {
      console.error('Erro ao atualizar role do usuário:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atribuir role:', error);
    return false;
  }
};
