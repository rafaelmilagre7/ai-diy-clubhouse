
import { supabase } from '@/lib/supabase';

// Centralizada função de verificação de admin
export const verifyAdminStatus = async (userId: string, email?: string): Promise<boolean> => {
  try {
    // Verificação rápida por email para domínios confiáveis
    if (email) {
      const isAdminByEmail = email.includes('@viverdeia.ai') || 
                           email === 'admin@teste.com' || 
                           email === 'admin@viverdeia.ai';
      
      if (isAdminByEmail) {
        return true;
      }
    }

    // Verificação no banco de dados usando função RPC otimizada
    const { data, error } = await supabase.rpc('is_user_admin', {
      user_id: userId
    });
    
    if (error) {
      console.error('Erro ao verificar status de admin:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    return false;
  }
};

// Cache de permissões com TTL reduzido
const permissionCache = new Map<string, { permissions: string[], timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

export const getUserPermissions = async (userId: string): Promise<string[]> => {
  const cached = permissionCache.get(userId);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.permissions;
  }

  try {
    const { data, error } = await supabase.rpc('get_user_permissions', {
      user_id: userId
    });
    
    if (error) throw error;
    
    const permissions = data || [];
    permissionCache.set(userId, { permissions, timestamp: Date.now() });
    
    return permissions;
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    return [];
  }
};

// Função para limpar cache de permissões
export const clearPermissionCache = (userId?: string) => {
  if (userId) {
    permissionCache.delete(userId);
  } else {
    permissionCache.clear();
  }
};

// Logging de eventos de segurança
export const logSecurityEvent = async (
  actionType: string,
  resourceType: string,
  resourceId?: string,
  oldValues?: any,
  newValues?: any
) => {
  try {
    await supabase.rpc('log_security_event', {
      p_action_type: actionType,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_old_values: oldValues ? JSON.stringify(oldValues) : null,
      p_new_values: newValues ? JSON.stringify(newValues) : null
    });
  } catch (error) {
    console.error('Erro ao registrar evento de segurança:', error);
  }
};
