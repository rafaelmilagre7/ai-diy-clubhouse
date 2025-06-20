
import { supabase } from '@/lib/supabase';

/**
 * Verifica se o usuário tem uma permissão específica
 */
export async function checkUserPermission(userId: string, permission: string): Promise<boolean> {
  try {
    if (!userId || !permission) {
      return false;
    }

    // Usar RPC function para verificar permissão
    const { data, error } = await supabase.rpc('user_has_permission', {
      user_id: userId,
      permission_code: permission
    });

    if (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }

    return Boolean(data) || false;
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    return false;
  }
}

/**
 * Verifica se o usuário tem um papel específico
 */
export async function checkUserRole(userId: string, roleName: string): Promise<boolean> {
  try {
    if (!userId || !roleName) {
      return false;
    }

    const { data, error } = await supabase.rpc('has_role', {
      role_name: roleName
    });

    if (error) {
      console.error('Erro ao verificar papel:', error);
      return false;
    }

    return Boolean(data) || false;
  } catch (error) {
    console.error('Erro ao verificar papel:', error);
    return false;
  }
}
