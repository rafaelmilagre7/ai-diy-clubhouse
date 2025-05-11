
import { useAuth } from '@/contexts/auth';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type Permission = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
};

export type Role = {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: Record<string, any>;
};

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Buscar todas as permissões disponíveis no sistema
  const fetchAllPermissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('permission_definitions')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setPermissions(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar permissões:', err);
      setError(err);
      toast.error('Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  };

  // Buscar os papéis disponíveis
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setRoles(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar papéis:', err);
      setError(err);
      toast.error('Erro ao carregar papéis de usuário');
    } finally {
      setLoading(false);
    }
  };

  // Buscar permissões do usuário atual
  const fetchUserPermissions = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_permissions', {
        user_id: user.id
      });

      if (error) throw error;

      // Se o usuário é admin, ele tem todas as permissões
      const isAdmin = data.some((code: string) => code === 'admin.all');
      
      if (isAdmin) {
        // Buscar todas as permissões e usar seus códigos
        const { data: allPerms } = await supabase
          .from('permission_definitions')
          .select('code');
          
        setUserPermissions(allPerms?.map(p => p.code) || []);
      } else {
        setUserPermissions(data || []);
      }
    } catch (err: any) {
      console.error('Erro ao buscar permissões do usuário:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Verificar se o usuário tem determinada permissão
  const hasPermission = (permissionCode: string): boolean => {
    return userPermissions.includes(permissionCode) || 
           userPermissions.includes('admin.all');
  };

  useEffect(() => {
    fetchAllPermissions();
    fetchRoles();
    fetchUserPermissions();
  }, [user?.id]);

  return {
    permissions,
    userPermissions,
    roles,
    loading,
    error,
    hasPermission,
    fetchAllPermissions,
    fetchRoles,
    fetchUserPermissions
  };
};
