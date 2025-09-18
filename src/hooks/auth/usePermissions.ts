
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
  
  // CORREÇÃO: Não usar useAuth aqui para evitar dependência circular
  let user = null;
  let isAdmin = false;
  
  try {
    const authContext = useAuth();
    user = authContext?.user;
    isAdmin = authContext?.isAdmin || false;
  } catch (error) {
    // Fallback gracioso se AuthContext não estiver disponível
    console.log('⚠️ [PERMISSIONS] AuthContext não disponível durante inicialização');
  }

  const hasPermission = (permissionCode: string): boolean => {
    // Admin tem todas as permissões
    if (isAdmin) return true;
    
    // Verificar se o usuário tem a permissão específica
    return userPermissions.includes(permissionCode);
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
    if (!user?.id) {
      setUserPermissions([]);
      return;
    }

    try {
      // CORREÇÃO DE EMERGÊNCIA: Timeout reduzido para 3 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Permissions timeout')), 3000)
      );

      const rpcPromise = supabase.rpc('get_user_permissions', {
        p_user_id: user.id
      });

      const { data, error } = await Promise.race([rpcPromise, timeoutPromise]) as any;

      if (error) throw error;
      
      console.log('✅ [PERMISSIONS] Permissões carregadas:', data?.length || 0);
      setUserPermissions(data || []);
    } catch (error) {
      console.warn('⚠️ [PERMISSIONS] Erro ao buscar permissões, usando fallback:', error.message);
      
      // FALLBACK DE EMERGÊNCIA: Permissões básicas para manter sistema funcionando
      const basicPermissions = [
        'solutions.access',
        'learning.access', 
        'community.access',
        'networking.access'
      ];
      
      console.log('🆘 [PERMISSIONS] Aplicando permissões básicas de emergência');
      setUserPermissions(basicPermissions);
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
