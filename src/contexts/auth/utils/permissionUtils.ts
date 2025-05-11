
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
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        role_id,
        user_roles!inner (
          id,
          name,
          permissions,
          role_permissions (
            permission_definitions (
              code
            )
          )
        )
      `)
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar permissões do usuário:', error);
      return [];
    }
    
    // Verificar se é admin (tem todas as permissões)
    if (data?.user_roles?.permissions?.all === true) {
      return ['*']; // Wildcard para todas as permissões
    }
    
    // Extrair códigos de permissão
    const permissionCodes = data?.user_roles?.role_permissions
      ?.map((rp: any) => rp.permission_definitions?.code)
      .filter(Boolean) || [];
    
    return permissionCodes;
  } catch (error) {
    console.error('Erro ao buscar permissões do usuário:', error);
    return [];
  }
};
