
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const hasPermission = (permissionCode: string): boolean => {
    // Admin tem todas as permissões
    if (isAdmin) return true;
    
    // Verificar se o usuário tem a permissão específica
    return userPermissions.includes(permissionCode) || userPermissions.includes('admin.all');
  };

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('permission_definitions')
        .select('*')
        .order('category, name');

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Erro ao carregar papéis:', error);
    }
  };

  const fetchUserPermissions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.rpc('get_user_permissions', {
        p_user_id: user.id
      });

      if (error) throw error;
      setUserPermissions(data || []);
    } catch (error) {
      console.error('Erro ao buscar permissões do usuário:', error);
      setUserPermissions([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchPermissions(),
        fetchRoles(),
        fetchUserPermissions()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user?.id]);

  return { 
    permissions, 
    roles,
    userPermissions,
    loading, 
    hasPermission,
    fetchPermissions,
    fetchRoles,
    fetchUserPermissions
  };
};
