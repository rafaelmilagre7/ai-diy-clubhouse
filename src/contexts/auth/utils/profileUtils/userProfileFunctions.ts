
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
    return data as UserProfile;
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
      userProfile = data as UserProfile;
    }
    
    return userProfile;
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    // Remover campos que não devem ser atualizados diretamente ou que causam conflito de tipo
    const { user_roles, ...cleanUpdates } = updates;
    
    const updateData = {
      ...cleanUpdates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
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
    return data as UserProfile;
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
    // Remover campos que não devem ser inseridos diretamente
    const { user_roles, ...cleanUserData } = userData;
    
    const profileData = {
      id: cleanUserData.id,
      email: cleanUserData.email,
      name: cleanUserData.name,
      avatar_url: cleanUserData.avatar_url,
      company_name: cleanUserData.company_name,
      industry: cleanUserData.industry,
      role_id: cleanUserData.role_id,
      phone: cleanUserData.phone,
      instagram: cleanUserData.instagram,
      linkedin: cleanUserData.linkedin,
      state: cleanUserData.state,
      city: cleanUserData.city,
      company_website: cleanUserData.company_website,
      company_size: cleanUserData.company_size,
      annual_revenue: cleanUserData.annual_revenue,
      ai_knowledge_level: cleanUserData.ai_knowledge_level,
      position: cleanUserData.position,
      onboarding_completed: cleanUserData.onboarding_completed || false,
      birth_date: cleanUserData.birth_date || null,
      curiosity: cleanUserData.curiosity || null,
      business_sector: cleanUserData.business_sector || null,
      has_implemented_ai: cleanUserData.has_implemented_ai || "false",
      ai_tools_used: cleanUserData.ai_tools_used || [],
      daily_tools: cleanUserData.daily_tools || [],
      who_will_implement: cleanUserData.who_will_implement || null,
      main_objective: cleanUserData.main_objective || null,
      area_to_impact: cleanUserData.area_to_impact || null,
      expected_result_90_days: cleanUserData.expected_result_90_days || null,
      ai_implementation_budget: cleanUserData.ai_implementation_budget || null,
      weekly_learning_time: cleanUserData.weekly_learning_time || null,
      content_preference: cleanUserData.content_preference || [],
      wants_networking: cleanUserData.wants_networking || null,
      best_days: cleanUserData.best_days || [],
      best_periods: cleanUserData.best_periods || [],
      accepts_case_study: cleanUserData.accepts_case_study || null,
      onboarding_completed_at: cleanUserData.onboarding_completed_at || null,
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
    return data as UserProfile;
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
