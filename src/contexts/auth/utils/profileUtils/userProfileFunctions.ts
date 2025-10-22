
import { supabase, UserProfile } from '@/lib/supabase';
import { getUserRoleName } from '@/lib/supabase/types';

/**
 * Função robusta para buscar perfil do usuário com múltiplas estratégias
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // ESTRATÉGIA 1: Tentar busca com JOIN (método preferido)
    try {
      const { data: profileWithJoin, error: joinError } = await supabase
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
          user_roles:role_id (
            id,
            name,
            description,
            permissions,
            is_system
          )
        `)
        .eq('id', userId)
        .single();

      if (!joinError && profileWithJoin) {
        const profile: UserProfile = {
          id: profileWithJoin.id,
          email: profileWithJoin.email,
          name: profileWithJoin.name,
          role_id: profileWithJoin.role_id,
          avatar_url: profileWithJoin.avatar_url,
          company_name: profileWithJoin.company_name,
          industry: profileWithJoin.industry,
          created_at: profileWithJoin.created_at,
          user_roles: profileWithJoin.user_roles as any
        };
        
        return profile;
      }
    } catch (joinError) {
      // Falha silenciosa - continuar para estratégia 2
    }

    // ESTRATÉGIA 2: Busca básica do perfil + role separadamente
    const { data: basicProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ [PROFILE-FETCH] Erro ao buscar perfil básico:', profileError);
      return null;
    }
    
    if (!basicProfile) {
      return null;
    }

    // Buscar role separadamente se existe role_id
    let userRole = null;
    if (basicProfile.role_id) {
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('id', basicProfile.role_id)
          .single();
        
        if (!roleError && roleData) {
          userRole = roleData;
        }
      } catch (roleError) {
        // Falha silenciosa
      }
    }

    // ESTRATÉGIA 3: Construir perfil com dados disponíveis
    const profile: UserProfile = {
      id: basicProfile.id,
      email: basicProfile.email,
      name: basicProfile.name,
      role_id: basicProfile.role_id,
      avatar_url: basicProfile.avatar_url,
      company_name: basicProfile.company_name,
      industry: basicProfile.industry,
      created_at: basicProfile.created_at,
      user_roles: userRole
    };

    return profile;

  } catch (error) {
    console.error('💥 [PROFILE-FETCH] Erro crítico na busca do perfil:', error);
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
    console.log(`🔨 [PROFILE-CREATE] Tentando criar perfil para ${email}`);
    
    // Buscar role_id padrão para membro_club
    const { data: defaultRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'membro_club')
      .single();
    
    const defaultRoleId = defaultRole?.id || null;
    
    // Use upsert with conflict handling to avoid duplications
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        name,
        role_id: defaultRoleId,
        created_at: new Date().toISOString(),
        avatar_url: null,
        company_name: null,
        industry: null,
      })
      .select(`
        id,
        email,
        name,
        role_id,
        avatar_url,
        company_name,
        industry,
        created_at,
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
      console.error('❌ [PROFILE-CREATE] Erro ao criar perfil:', insertError);
      return createFallbackProfile(userId, email, name, defaultRoleId);
    }
    
    const profile: UserProfile = {
      id: newProfile.id,
      email: newProfile.email,
      name: newProfile.name,
      role_id: newProfile.role_id,
      avatar_url: newProfile.avatar_url,
      company_name: newProfile.company_name,
      industry: newProfile.industry,
      created_at: newProfile.created_at,
      user_roles: newProfile.user_roles as any
    };
    
    console.log('✅ [PROFILE-CREATE] Perfil criado com sucesso:', profile);
    return profile;
  } catch (error) {
    console.error('💥 [PROFILE-CREATE] Erro inesperado ao criar perfil:', error);
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
  console.log(`🆘 [PROFILE-FALLBACK] Criando perfil alternativo para ${email}`);
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
  };
};
