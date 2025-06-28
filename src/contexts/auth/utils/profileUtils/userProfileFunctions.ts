
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles (
          id,
          name,
          description
        )
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
};

export const createUserProfileIfNeeded = async (userId: string, email?: string): Promise<UserProfile | null> => {
  try {
    // Primeiro tenta buscar o perfil existente
    let userProfile = await fetchUserProfile(userId);
    
    if (!userProfile && email) {
      // Se não existe, cria um novo com todos os campos obrigatórios
      const profileData = {
        id: userId,
        email: email,
        name: null,
        avatar_url: null,
        company_name: null,
        industry: null,
        role_id: null,
        phone: null,
        instagram: null,
        linkedin: null,
        state: null,
        city: null,
        company_website: null,
        company_size: null,
        annual_revenue: null,
        ai_knowledge_level: null,
        position: null,
        onboarding_completed: false,
        birth_date: null,
        curiosity: null,
        business_sector: null,
        has_implemented_ai: "false",
        ai_tools_used: [],
        daily_tools: [],
        who_will_implement: null,
        main_objective: null,
        area_to_impact: null,
        expected_result_90_days: null,
        ai_implementation_budget: null,
        weekly_learning_time: null,
        content_preference: [],
        wants_networking: null,
        best_days: [],
        best_periods: [],
        accepts_case_study: null,
        onboarding_completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select(`
          *,
          user_roles (
            id,
            name,
            description
          )
        `)
        .single();

      if (error) throw error;
      userProfile = data;
    }
    
    return userProfile;
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return null;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  return fetchUserProfile(userId);
};

export const createUserProfile = async (userData: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const profileData = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      avatar_url: userData.avatar_url,
      company_name: userData.company_name,
      industry: userData.industry,
      role_id: userData.role_id,
      phone: userData.phone,
      instagram: userData.instagram,
      linkedin: userData.linkedin,
      state: userData.state,
      city: userData.city,
      company_website: userData.company_website,
      company_size: userData.company_size,
      annual_revenue: userData.annual_revenue,
      ai_knowledge_level: userData.ai_knowledge_level,
      position: userData.position,
      onboarding_completed: userData.onboarding_completed || false,
      birth_date: userData.birth_date || null,
      curiosity: userData.curiosity || null,
      business_sector: userData.business_sector || null,
      has_implemented_ai: userData.has_implemented_ai || "false",
      ai_tools_used: userData.ai_tools_used || [],
      daily_tools: userData.daily_tools || [],
      who_will_implement: userData.who_will_implement || null,
      main_objective: userData.main_objective || null,
      area_to_impact: userData.area_to_impact || null,
      expected_result_90_days: userData.expected_result_90_days || null,
      ai_implementation_budget: userData.ai_implementation_budget || null,
      weekly_learning_time: userData.weekly_learning_time || null,
      content_preference: userData.content_preference || [],
      wants_networking: userData.wants_networking || null,
      best_days: userData.best_days || [],
      best_periods: userData.best_periods || [],
      accepts_case_study: userData.accepts_case_study || null,
      onboarding_completed_at: userData.onboarding_completed_at || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    return null;
  }
};

export const deleteUserProfile = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao deletar perfil:', error);
    return false;
  }
};
