import { supabase } from "@/lib/supabase";

// Função para obter role do usuário usando SECURITY DEFINER
export const getUserRoleSecure = async (userId?: string): Promise<string> => {
  if (!userId) {
    return 'anonymous';
  }

  try {
    const { data, error } = await supabase.rpc('get_user_role_secure', {
      target_user_id: userId
    });

    if (error) {
      console.error('Erro ao obter role:', error);
      return 'member';
    }

    return data || 'member';
  } catch (error) {
    console.error('Erro ao verificar role:', error);
    return 'member';
  }
};

// Função para verificar se usuário é admin usando SECURITY DEFINER
export const isUserAdminSecure = async (userId?: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }

  try {
    const { data, error } = await supabase.rpc('is_user_admin_secure', {
      target_user_id: userId
    });

    if (error) {
      console.error('Erro ao verificar admin:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    return false;
  }
};

// Função para verificar acesso a conteúdo de aprendizado
export const canAccessLearningContent = async (userId?: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }

  try {
    const { data, error } = await supabase.rpc('can_access_learning_content', {
      target_user_id: userId
    });

    if (error) {
      console.error('Erro ao verificar acesso a conteúdo:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Erro ao verificar acesso:', error);
    return false;
  }
};