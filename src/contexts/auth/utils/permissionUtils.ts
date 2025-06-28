
import { supabase } from '@/lib/supabase';

/**
 * Verifica se o usuário tem uma permissão específica
 */
export async function checkUserPermission(userId: string, permission: string): Promise<boolean> {
  try {
    if (!userId || !permission) {
      return false;
    }

    // Implementação simplificada - verificar role diretamente
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_roles(name)')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }

    // Verificações básicas baseadas no role
    const roleName = profile?.user_roles?.name;
    
    if (roleName === 'admin') return true;
    if (roleName === 'formacao' && permission.includes('course')) return true;
    
    return false;
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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_roles(name)')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao verificar papel:', error);
      return false;
    }

    return profile?.user_roles?.name === roleName;
  } catch (error) {
    console.error('Erro ao verificar papel:', error);
    return false;
  }
}
