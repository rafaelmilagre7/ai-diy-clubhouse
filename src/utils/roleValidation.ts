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
    console.log("🚫 canAccessLearningContent: userId não fornecido");
    return false;
  }

  try {
    console.log("🔍 Chamando can_access_learning_content para userId:", userId);
    
    const { data, error } = await supabase.rpc('can_access_learning_content', {
      target_user_id: userId
    });

    if (error) {
      console.error('❌ Erro ao verificar acesso a conteúdo:', error);
      return false;
    }

    console.log("✅ Resultado can_access_learning_content:", data);
    return data || false;
  } catch (error) {
    console.error('❌ Erro na chamada canAccessLearningContent:', error);
    return false;
  }
};

// Função para verificar acesso a um curso específico (com override)
export const canAccessCourseEnhanced = async (userId: string, courseId: string): Promise<boolean> => {
  try {
    console.log("🔍 Verificando acesso ao curso com override:", { userId, courseId });
    
    const { data, error } = await supabase.rpc('can_access_course_enhanced', {
      target_user_id: userId,
      target_course_id: courseId
    });

    if (error) {
      console.error('❌ Erro ao verificar acesso ao curso:', error);
      return false;
    }

    console.log("✅ Resultado can_access_course_enhanced:", data);
    return data || false;
  } catch (error) {
    console.error('❌ Erro na chamada canAccessCourseEnhanced:', error);
    return false;
  }
};