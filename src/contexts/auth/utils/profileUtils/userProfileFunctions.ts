
import { supabase } from '@/lib/supabase';
import { UserProfile, UserRole } from '@/lib/supabase/types';

// Helper function to create a complete UserProfile object with all required fields
const createCompleteUserProfile = (partialProfile: any): UserProfile => {
  return {
    id: partialProfile.id,
    email: partialProfile.email,
    name: partialProfile.name || null,
    avatar_url: partialProfile.avatar_url || null,
    company_name: partialProfile.company_name || null,
    industry: partialProfile.industry || null,
    role_id: partialProfile.role_id,
    user_roles: partialProfile.user_roles,
    created_at: partialProfile.created_at,
    updated_at: partialProfile.updated_at,
    phone: partialProfile.phone || null,
    instagram: partialProfile.instagram || null,
    linkedin: partialProfile.linkedin || null,
    state: partialProfile.state || null,
    city: partialProfile.city || null,
    company_website: partialProfile.company_website || null,
    company_size: partialProfile.company_size || null,
    annual_revenue: partialProfile.annual_revenue || null,
    ai_knowledge_level: partialProfile.ai_knowledge_level || null,
    role: partialProfile.role || null,
    onboarding_completed: partialProfile.onboarding_completed || false,
    onboarding_completed_at: partialProfile.onboarding_completed_at || null,
    birth_date: partialProfile.birth_date || null,
    curiosity: partialProfile.curiosity || null,
    business_sector: partialProfile.business_sector || null,
    position: partialProfile.position || null,
    has_implemented_ai: partialProfile.has_implemented_ai || null,
    ai_tools_used: partialProfile.ai_tools_used || [],
    daily_tools: partialProfile.daily_tools || [],
    who_will_implement: partialProfile.who_will_implement || null,
    main_objective: partialProfile.main_objective || null,
    area_to_impact: partialProfile.area_to_impact || null,
    expected_result_90_days: partialProfile.expected_result_90_days || null,
    ai_implementation_budget: partialProfile.ai_implementation_budget || null,
    weekly_learning_time: partialProfile.weekly_learning_time || null,
    content_preference: partialProfile.content_preference || [],
    wants_networking: partialProfile.wants_networking || null,
    best_days: partialProfile.best_days || [],
    best_periods: partialProfile.best_periods || [],
    accepts_case_study: partialProfile.accepts_case_study || null
  };
};

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles:role_id (
          id,
          name
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return createCompleteUserProfile(data);
  } catch (error) {
    console.error('Erro inesperado ao buscar perfil:', error);
    return null;
  }
}

export async function createUserProfileIfNeeded(userId: string, email: string): Promise<UserProfile | null> {
  try {
    // Primeiro, tentar buscar o perfil existente
    const existingProfile = await fetchUserProfile(userId);
    if (existingProfile) {
      return existingProfile;
    }

    // Se não existir, criar um novo perfil
    return await createUserProfile(userId, email);
  } catch (error) {
    console.error('Erro ao criar/buscar perfil do usuário:', error);
    return null;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return await fetchUserProfile(userId);
}

export async function createUserProfile(userId: string, email: string, additionalData?: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    // Buscar role padrão (member)
    const { data: memberRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'member')
      .single();

    const profileData = {
      id: userId,
      email: email,
      name: additionalData?.name || email.split('@')[0],
      role_id: memberRole?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      onboarding_completed: false,
      // Convert ai_knowledge_level to string if it's a number
      ai_knowledge_level: additionalData?.ai_knowledge_level ? String(additionalData.ai_knowledge_level) : null,
      // Include all other optional fields
      ...additionalData
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select(`
        *,
        user_roles:role_id (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Erro ao criar perfil:', error);
      return null;
    }

    return createCompleteUserProfile(data);
  } catch (error) {
    console.error('Erro inesperado ao criar perfil:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    // Prepare update data, converting ai_knowledge_level to string if needed
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
      // Ensure ai_knowledge_level is a string if provided
      ai_knowledge_level: updates.ai_knowledge_level !== undefined 
        ? String(updates.ai_knowledge_level) 
        : undefined
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select(`
        *,
        user_roles:role_id (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      return null;
    }

    return createCompleteUserProfile(data);
  } catch (error) {
    console.error('Erro inesperado ao atualizar perfil:', error);
    return null;
  }
}

export async function deleteUserProfile(userId: string): Promise<boolean> {
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
    console.error('Erro inesperado ao deletar perfil:', error);
    return false;
  }
}
