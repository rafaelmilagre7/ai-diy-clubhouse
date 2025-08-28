import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UserRole {
  id: string;
  name: string;
  description?: string;
}

interface RoleMapping {
  [roleName: string]: string; // name -> id
}

export const useRoleMapping = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [roleMapping, setRoleMapping] = useState<RoleMapping>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id, name, description')
        .order('name');

      if (error) throw error;

      setRoles(data || []);
      
      // Criar mapeamento nome -> id
      const mapping: RoleMapping = {};
      data?.forEach(role => {
        mapping[role.name.toLowerCase()] = role.id;
      });
      
      setRoleMapping(mapping);
      console.log('✅ [ROLE-MAPPING] Papéis carregados:', mapping);
    } catch (error: any) {
      console.error('❌ [ROLE-MAPPING] Erro ao carregar papéis:', error);
      toast.error('Erro ao carregar papéis disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const getRoleId = (roleName: string): string | null => {
    if (!roleName) return null;
    const roleId = roleMapping[roleName.toLowerCase()];
    if (!roleId) {
      console.warn(`⚠️ [ROLE-MAPPING] Papel não encontrado: ${roleName}`);
    }
    return roleId || null;
  };

  const getDefaultRoleId = (): string | null => {
    // Procura papel padrão (preferencialmente 'convidado')
    return getRoleId('convidado') || getRoleId('member') || getRoleId('membro') || null;
  };

  const validateRole = (roleName: string): boolean => {
    return getRoleId(roleName) !== null;
  };

  const getAvailableRoles = (): string[] => {
    const availableRoles = Object.keys(roleMapping);
    console.log('🔑 [ROLE-MAPPING] getAvailableRoles chamado:', {
      loading,
      roleMapping,
      availableRoles,
      roleCount: roles.length
    });
    
    // Se ainda está carregando ou roleMapping vazio, retornar lista padrão
    if (loading || availableRoles.length === 0) {
      const fallbackRoles = ['admin', 'convidado', 'hands_on', 'lovable_course'];
      console.log('⚠️ [ROLE-MAPPING] Usando fallback roles:', fallbackRoles);
      return fallbackRoles;
    }
    
    return availableRoles;
  };

  return {
    roles,
    roleMapping,
    loading,
    getRoleId,
    getDefaultRoleId,
    validateRole,
    getAvailableRoles,
    refetch: fetchRoles
  };
};