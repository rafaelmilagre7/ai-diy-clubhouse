
import { supabase } from '@/lib/supabase';
import { UserProfile, UserRole } from '@/lib/supabase/types';

interface UserRoleData {
  id: string;
  name: string;
  description?: string;
  permissions?: any;
  is_system?: boolean;
}

// Helper function to convert database row to UserProfile with proper type handling
const createCompleteUserProfile = (data: any): UserProfile => {
  return {
    id: data.id || '',
    email: data.email || '',
    name: data.name || '',
    avatar_url: data.avatar_url || '',
    company_name: data.company_name || '',
    industry: data.industry || '',
    role_id: data.role_id || '',
    role: data.role || '',
    created_at: data.created_at || '',
    updated_at: data.updated_at || '',
    onboarding_completed: data.onboarding_completed || false,
    onboarding_completed_at: data.onboarding_completed_at || '',
    phone: data.phone || '',
    whatsapp_number: data.whatsapp_number || '',
    linkedin: data.linkedin || '',
    instagram: data.instagram || '',
    country: data.country || '',
    state: data.state || '',
    city: data.city || '',
    business_challenges: data.business_challenges || [],
    user_roles: data.user_roles || null,
    // Add all required fields with defaults
    birth_date: data.birth_date || '',
    curiosity: data.curiosity || '',
    business_sector: data.business_sector || '',
    position: data.position || '',
    company_website: data.company_website || '',
    phone_country_code: data.phone_country_code || '+55',
    nps_score: data.nps_score || 0,
    ai_knowledge_level: typeof data.ai_knowledge_level === 'string' ? 
      parseInt(data.ai_knowledge_level) || 0 : (data.ai_knowledge_level || 0),
    primary_goal: data.primary_goal || '',
    annual_revenue: data.annual_revenue || '',
    company_size: data.company_size || '',
    weekly_availability: data.weekly_availability || '',
    networking_interests: data.networking_interests || [],
    current_position: data.current_position || '',
    referrals_count: data.referrals_count || 0,
    successful_referrals_count: data.successful_referrals_count || 0,
    accepts_case_study: data.accepts_case_study || ''
  };
};

// Helper function to prepare data for database operations
const prepareProfileForDatabase = (profile: Partial<UserProfile>) => {
  const dbProfile: any = { ...profile };
  
  // Convert ai_knowledge_level to number if it's a string
  if (typeof dbProfile.ai_knowledge_level === 'string') {
    dbProfile.ai_knowledge_level = parseInt(dbProfile.ai_knowledge_level) || 0;
  }
  
  // Remove complex objects that shouldn't be saved directly
  delete dbProfile.user_roles;
  
  // Ensure updated_at is set
  dbProfile.updated_at = new Date().toISOString();
  
  return dbProfile;
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('[PROFILE-UTILS] Buscando perfil para usuário:', userId);

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles:role_id(id, name, description, permissions, is_system)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[PROFILE-UTILS] Erro ao buscar perfil:', error);
      return null;
    }

    if (!data) {
      console.log('[PROFILE-UTILS] Perfil não encontrado');
      return null;
    }

    console.log('[PROFILE-UTILS] Perfil encontrado com sucesso');
    return createCompleteUserProfile(data);

  } catch (error) {
    console.error('[PROFILE-UTILS] Erro inesperado ao buscar perfil:', error);
    return null;
  }
};

export const createUserProfileIfNeeded = async (userId: string, email: string): Promise<UserProfile | null> => {
  try {
    console.log('[PROFILE-UTILS] Criando perfil se necessário para:', { userId, email });

    // Buscar role padrão de member
    const { data: memberRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'member')
      .single();

    if (!memberRole) {
      console.error('[PROFILE-UTILS] Role "member" não encontrada');
      return null;
    }

    const profileData = prepareProfileForDatabase({
      id: userId,
      email: email,
      name: email.split('@')[0], // Nome temporário baseado no email
      avatar_url: '',
      company_name: '',
      industry: '',
      role_id: memberRole.id,
      role: 'member',
      created_at: new Date().toISOString(),
      onboarding_completed: false,
      phone: '',
      whatsapp_number: '',
      linkedin: '',
      instagram: '',
      country: '',
      state: '',
      city: '',
      business_challenges: []
    });

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select(`
        *,
        user_roles:role_id(id, name, description, permissions, is_system)
      `)
      .single();

    if (error) {
      console.error('[PROFILE-UTILS] Erro ao criar perfil:', error);
      return null;
    }

    console.log('[PROFILE-UTILS] Perfil criado com sucesso');
    return createCompleteUserProfile(data);

  } catch (error) {
    console.error('[PROFILE-UTILS] Erro inesperado ao criar perfil:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    console.log('[PROFILE-UTILS] Atualizando perfil:', { userId, updates });

    const profileData = prepareProfileForDatabase(updates);

    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select(`
        *,
        user_roles:role_id(id, name, description, permissions, is_system)
      `)
      .single();

    if (error) {
      console.error('[PROFILE-UTILS] Erro ao atualizar perfil:', error);
      return null;
    }

    console.log('[PROFILE-UTILS] Perfil atualizado com sucesso');
    return createCompleteUserProfile(data);

  } catch (error) {
    console.error('[PROFILE-UTILS] Erro inesperado ao atualizar perfil:', error);
    return null;
  }
};

export const deleteUserProfile = async (userId: string): Promise<boolean> => {
  try {
    console.log('[PROFILE-UTILS] Deletando perfil:', userId);

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('[PROFILE-UTILS] Erro ao deletar perfil:', error);
      return false;
    }

    console.log('[PROFILE-UTILS] Perfil deletado com sucesso');
    return true;

  } catch (error) {
    console.error('[PROFILE-UTILS] Erro inesperado ao deletar perfil:', error);
    return false;
  }
};

// Aliases for backward compatibility
export const getUserProfile = fetchUserProfile;
export const createUserProfile = createUserProfileIfNeeded;
