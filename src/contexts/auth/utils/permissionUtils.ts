
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

// Consolidado em securityUtils.ts - importar de lá para evitar duplicação
export { getUserPermissions } from './securityUtils';
