
import { supabase } from "@/lib/supabase";

export const checkUserPermission = async (
  userId: string,
  permissionCode: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('user_has_permission', {
      user_id: userId,
      permission_code: permissionCode
    });
    
    if (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    return false;
  }
};

export const getUserPermissions = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase.rpc('get_user_permissions', {
      user_id: userId
    });
    
    if (error) {
      console.error('Erro ao buscar permissões do usuário:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar permissões do usuário:', error);
    return [];
  }
};
