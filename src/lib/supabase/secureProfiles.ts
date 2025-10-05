/**
 * Secure Profile Access Layer
 * 
 * Este módulo fornece funções seguras para acessar dados de perfil,
 * implementando proteções contra enumeração de usuários e exposição de dados sensíveis.
 * 
 * IMPORTANTE: Use estas funções ao invés de queries diretas quando possível.
 */

import { supabase } from './client';
import type { UserProfile } from './types';

/**
 * Interface para perfil seguro (com dados potencialmente mascarados)
 */
export interface SafeProfile {
  id: string;
  name: string | null;
  email: string; // Pode estar mascarado
  avatar_url: string | null;
  bio: string | null;
  company_name: string | null;
  company_size: string | null;
  industry: string | null;
  role_id: string | null;
  is_master_user: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  // Campos sensíveis - null se não tiver permissão
  whatsapp_number?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  cpf?: string | null;
}

/**
 * Busca perfil completo do usuário atual
 * Garante que apenas dados do próprio usuário são retornados
 */
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles:role_id (
          id,
          name,
          description,
          permissions
        )
      `)
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil atual:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Erro ao buscar perfil atual:', error);
    return null;
  }
};

/**
 * Busca perfil seguro de outro usuário (com mascaramento automático)
 * Usa a função RPC get_safe_profile que aplica regras de segurança
 */
export const getSafeProfile = async (userId: string): Promise<SafeProfile | null> => {
  try {
    const { data, error } = await supabase.rpc('get_safe_profile', {
      target_user_id: userId
    });

    if (error) {
      console.error('Erro ao buscar perfil seguro:', error);
      return null;
    }

    return data as SafeProfile;
  } catch (error) {
    console.error('Erro ao buscar perfil seguro:', error);
    return null;
  }
};

/**
 * Busca perfis seguros de múltiplos usuários
 * Implementa batching para melhor performance
 */
export const getSafeProfiles = async (userIds: string[]): Promise<SafeProfile[]> => {
  try {
    // Usar a view profiles_safe que já tem mascaramento
    const { data, error } = await supabase
      .from('profiles_safe')
      .select('*')
      .in('id', userIds);

    if (error) {
      console.error('Erro ao buscar perfis seguros:', error);
      return [];
    }

    return data as SafeProfile[];
  } catch (error) {
    console.error('Erro ao buscar perfis seguros:', error);
    return [];
  }
};

/**
 * Busca membros da organização (apenas dados seguros)
 * Ideal para listagens de equipe
 */
export const getOrganizationMembers = async (organizationId: string): Promise<SafeProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles_safe')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');

    if (error) {
      console.error('Erro ao buscar membros da organização:', error);
      return [];
    }

    return data as SafeProfile[];
  } catch (error) {
    console.error('Erro ao buscar membros da organização:', error);
    return [];
  }
};

/**
 * Verifica se usuário atual pode ver dados completos de outro perfil
 */
export const canViewFullProfile = async (targetUserId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('can_view_full_profile', {
      target_user_id: targetUserId
    });

    if (error) {
      console.error('Erro ao verificar permissão de visualização:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Erro ao verificar permissão de visualização:', error);
    return false;
  }
};

/**
 * Hook auxiliar para validar acesso antes de queries sensíveis
 */
export const validateProfileAccess = async (
  targetUserId: string,
  operation: 'read' | 'write'
): Promise<{ allowed: boolean; reason?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { allowed: false, reason: 'Usuário não autenticado' };
    }

    // Sempre pode acessar próprio perfil
    if (user.id === targetUserId) {
      return { allowed: true };
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role_id, user_roles:role_id(name)')
      .eq('id', user.id)
      .single();

    const roleName = (profile as any)?.user_roles?.name;
    const isAdmin = roleName === 'admin';

    if (isAdmin) {
      return { allowed: true };
    }

    // Para operações de escrita, apenas próprio perfil ou admin
    if (operation === 'write') {
      return { allowed: false, reason: 'Sem permissão para modificar outro perfil' };
    }

    // Para leitura, verificar se são da mesma organização
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', targetUserId)
      .single();

    if (profile && targetProfile && 
        (profile as any).organization_id === (targetProfile as any).organization_id) {
      return { allowed: true };
    }

    return { allowed: false, reason: 'Sem permissão para visualizar este perfil' };
  } catch (error) {
    console.error('Erro ao validar acesso:', error);
    return { allowed: false, reason: 'Erro ao validar permissões' };
  }
};

/**
 * Exportar funções de mascaramento para uso no cliente quando necessário
 */
export const maskEmail = (email: string | null): string => {
  if (!email) return '[email protegido]';
  
  const [local, domain] = email.split('@');
  if (!local || !domain) return '[email protegido]';
  
  const maskedLocal = local.length <= 2 
    ? '*'.repeat(local.length)
    : local[0] + '*'.repeat(local.length - 2) + local[local.length - 1];
  
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  
  return `${maskedLocal}@***.${tld}`;
};

export const maskPhone = (phone: string | null): string => {
  if (!phone) return '[telefone protegido]';
  return '***-***-****';
};

export const maskName = (name: string | null): string => {
  if (!name || !name.trim()) return '[Nome protegido]';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  
  return parts[0] + ' ' + parts.slice(1).map(p => p[0] + '.').join(' ');
};
