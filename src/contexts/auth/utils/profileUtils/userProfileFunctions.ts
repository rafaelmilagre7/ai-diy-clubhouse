
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

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
      position: userData.position, // Usar 'position' ao invés de 'current_position'
      onboarding_completed: userData.onboarding_completed || false,
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

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const updateData = {
      ...updates,
      position: updates.position, // Garantir que usa 'position'
      updated_at: new Date().toISOString()
    };

    // Remover campos que não existem na tabela
    delete (updateData as any).current_position;

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
