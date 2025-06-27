
import { supabase, UserProfile } from '@/lib/supabase';
import { getUserRoleName } from '@/lib/supabase/types';

/**
 * Fetch user profile from Supabase com join para user_roles
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log(`Buscando perfil para usuário: ${userId}`);
    
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        name,
        role_id,
        avatar_url,
        company_name,
        industry,
        created_at,
        updated_at,
        phone,
        instagram,
        linkedin,
        state,
        city,
        company_website,
        current_position,
        company_sector,
        company_size,
        annual_revenue,
        primary_goal,
        business_challenges,
        ai_knowledge_level,
        nps_score,
        weekly_availability,
        networking_interests,
        phone_country_code,
        role,
        onboarding_completed,
        onboarding_completed_at,
        referrals_count,
        successful_referrals_count,
        user_roles:role_id (
          id,
          name,
          description,
          permissions,
          is_system
        )
      `)
      .eq('id', userId as any)
      .single();

    if (error) {
      if (error.message.includes('infinite recursion')) {
        console.warn('Detectada recursão infinita na política. Tentando criar perfil como solução alternativa.');
        return null;
      }
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    if (!data) {
      console.warn(`Nenhum perfil encontrado para o usuário ${userId}`);
      return null;
    }
    
    // Mapear corretamente o resultado da query
    const profile: UserProfile = {
      id: (data as any).id,
      email: (data as any).email,
      name: (data as any).name,
      role_id: (data as any).role_id,
      avatar_url: (data as any).avatar_url,
      company_name: (data as any).company_name,
      industry: (data as any).industry,
      created_at: (data as any).created_at,
      updated_at: (data as any).updated_at || (data as any).created_at,
      phone: (data as any).phone,
      instagram: (data as any).instagram,
      linkedin: (data as any).linkedin,
      state: (data as any).state,
      city: (data as any).city,
      company_website: (data as any).company_website,
      current_position: (data as any).current_position,
      company_sector: (data as any).company_sector,
      company_size: (data as any).company_size,
      annual_revenue: (data as any).annual_revenue,
      primary_goal: (data as any).primary_goal,
      business_challenges: (data as any).business_challenges,
      ai_knowledge_level: (data as any).ai_knowledge_level,
      nps_score: (data as any).nps_score,
      weekly_availability: (data as any).weekly_availability,
      networking_interests: (data as any).networking_interests,
      phone_country_code: (data as any).phone_country_code,
      role: (data as any).role,
      onboarding_completed: (data as any).onboarding_completed,
      onboarding_completed_at: (data as any).onboarding_completed_at,
      referrals_count: (data as any).referrals_count || 0,
      successful_referrals_count: (data as any).successful_referrals_count || 0,
      user_roles: (data as any).user_roles as any
    };
    
    console.log('Perfil encontrado:', profile);
    return profile;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null;
  }
};

/**
 * Create profile for user if it doesn't exist
 */
export const createUserProfileIfNeeded = async (
  userId: string, 
  email: string, 
  name: string = 'Usuário'
): Promise<UserProfile | null> => {
  try {
    console.log(`Tentando criar perfil para ${email}`);
    
    // Buscar role_id padrão para membro_club
    const { data: defaultRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'membro_club' as any)
      .single();
    
    const defaultRoleId = (defaultRole as any)?.id || null;
    
    // Use upsert with conflict handling to avoid duplications
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        name,
        role_id: defaultRoleId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        avatar_url: null,
        company_name: null,
        industry: null,
        phone: null,
        instagram: null,
        linkedin: null,
        state: null,
        city: null,
        company_website: null,
        current_position: null,
        company_sector: null,
        company_size: null,
        annual_revenue: null,
        primary_goal: null,
        business_challenges: null,
        ai_knowledge_level: null,
        nps_score: null,
        weekly_availability: null,
        networking_interests: null,
        phone_country_code: null,
        role: null,
        onboarding_completed: false,
        onboarding_completed_at: null,
        referrals_count: 0,
        successful_referrals_count: 0
      } as any)
      .select(`
        id,
        email,
        name,
        role_id,
        avatar_url,
        company_name,
        industry,
        created_at,
        updated_at,
        phone,
        instagram,
        linkedin,
        state,
        city,
        company_website,
        current_position,
        company_sector,
        company_size,
        annual_revenue,
        primary_goal,
        business_challenges,
        ai_knowledge_level,
        nps_score,
        weekly_availability,
        networking_interests,
        phone_country_code,
        role,
        onboarding_completed,
        onboarding_completed_at,
        referrals_count,
        successful_referrals_count,
        user_roles:role_id (
          id,
          name,
          description,
          permissions,
          is_system
        )
      `)
      .single();
      
    if (insertError) {
      if (insertError.message.includes('policy') || insertError.message.includes('permission denied')) {
        console.warn('Erro de política ao criar perfil. Continuando com perfil alternativo:', insertError);
        return createFallbackProfile(userId, email, name, defaultRoleId);
      }
      
      console.error('Erro ao criar perfil:', insertError);
      return createFallbackProfile(userId, email, name, defaultRoleId);
    }
    
    // Mapear corretamente o resultado da query
    const profile: UserProfile = {
      id: (newProfile as any).id,
      email: (newProfile as any).email,
      name: (newProfile as any).name,
      role_id: (newProfile as any).role_id,
      avatar_url: (newProfile as any).avatar_url,
      company_name: (newProfile as any).company_name,
      industry: (newProfile as any).industry,
      created_at: (newProfile as any).created_at,
      updated_at: (newProfile as any).updated_at,
      phone: (newProfile as any).phone,
      instagram: (newProfile as any).instagram,
      linkedin: (newProfile as any).linkedin,
      state: (newProfile as any).state,
      city: (newProfile as any).city,
      company_website: (newProfile as any).company_website,
      current_position: (newProfile as any).current_position,
      company_sector: (newProfile as any).company_sector,
      company_size: (newProfile as any).company_size,
      annual_revenue: (newProfile as any).annual_revenue,
      primary_goal: (newProfile as any).primary_goal,
      business_challenges: (newProfile as any).business_challenges,
      ai_knowledge_level: (newProfile as any).ai_knowledge_level,
      nps_score: (newProfile as any).nps_score,
      weekly_availability: (newProfile as any).weekly_availability,
      networking_interests: (newProfile as any).networking_interests,
      phone_country_code: (newProfile as any).phone_country_code,
      role: (newProfile as any).role,
      onboarding_completed: (newProfile as any).onboarding_completed,
      onboarding_completed_at: (newProfile as any).onboarding_completed_at,
      referrals_count: (newProfile as any).referrals_count || 0,
      successful_referrals_count: (newProfile as any).successful_referrals_count || 0,
      user_roles: (newProfile as any).user_roles as any
    };
    
    console.log('Perfil criado com sucesso:', profile);
    return profile;
  } catch (error) {
    console.error('Erro inesperado ao criar perfil:', error);
    return createFallbackProfile(userId, email, name, null);
  }
};

/**
 * Creates a minimal fallback profile when database operations fail
 */
const createFallbackProfile = (
  userId: string, 
  email: string, 
  name: string, 
  roleId: string | null
): UserProfile => {
  console.log(`Criando perfil alternativo para ${email}`);
  return {
    id: userId,
    email,
    name,
    role_id: roleId,
    user_roles: roleId ? { id: roleId, name: 'membro_club' } : null,
    avatar_url: null,
    company_name: null,
    industry: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phone: null,
    instagram: null,
    linkedin: null,
    state: null,
    city: null,
    company_website: null,
    current_position: null,
    company_sector: null,
    company_size: null,
    annual_revenue: null,
    primary_goal: null,
    business_challenges: null,
    ai_knowledge_level: null,
    nps_score: null,
    weekly_availability: null,
    networking_interests: null,
    phone_country_code: null,
    role: null,
    onboarding_completed: false,
    onboarding_completed_at: null,
    referrals_count: 0,
    successful_referrals_count: 0
  };
};
