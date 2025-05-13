import { useAuth } from '@/contexts/auth';
import { useState, useEffect, useCallback, useRef } from 'react';
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

// Cache global para armazenar permissões entre instâncias do hook
const globalPermissionsCache = {
  allPermissions: null as Permission[] | null,
  userPermissions: new Map<string, string[]>(),
  roles: null as Role[] | null,
  lastFetch: 0
};

// Tempo de validade do cache em ms (2 minutos)
const CACHE_VALIDITY = 2 * 60 * 1000;

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Cache local para esta instância do hook
  const permissionCheckCache = useRef<Map<string, boolean>>(new Map());
  
  // Verificar se o cache global está válido
  const isGlobalCacheValid = useCallback(() => {
    return (Date.now() - globalPermissionsCache.lastFetch) < CACHE_VALIDITY;
  }, []);

  // Abortar requisições anteriores quando o componente desmontar ou atualizar
  const abortPreviousRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  
  // Limpar timeouts quando o componente desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      abortPreviousRequests();
    };
  }, [abortPreviousRequests]);

  // Buscar todas as permissões disponíveis no sistema
  const fetchAllPermissions = useCallback(async () => {
    // Se já temos permissões em cache e o cache é válido, usá-lo
    if (globalPermissionsCache.allPermissions && isGlobalCacheValid()) {
      console.log("Usando cache para todas as permissões");
      setPermissions(globalPermissionsCache.allPermissions);
      return;
    }
    
    try {
      abortPreviousRequests();
      abortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('permission_definitions')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      // Atualizar cache global
      globalPermissionsCache.allPermissions = data || [];
      globalPermissionsCache.lastFetch = Date.now();
      
      setPermissions(data || []);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao buscar permissões:', err);
        setError(err);
      }
    }
  }, [isGlobalCacheValid, abortPreviousRequests]);

  // Buscar os papéis disponíveis
  const fetchRoles = useCallback(async () => {
    // Se já temos papéis em cache e o cache é válido, usá-lo
    if (globalPermissionsCache.roles && isGlobalCacheValid()) {
      console.log("Usando cache para papéis");
      setRoles(globalPermissionsCache.roles);
      return;
    }
    
    try {
      abortPreviousRequests();
      abortControllerRef.current = new AbortController();
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      // Atualizar cache global
      globalPermissionsCache.roles = data || [];
      globalPermissionsCache.lastFetch = Date.now();
      
      setRoles(data || []);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao buscar papéis:', err);
        setError(err);
      }
    }
  }, [isGlobalCacheValid, abortPreviousRequests]);

  // Buscar permissões do usuário atual com retry e fallback
  const fetchUserPermissions = useCallback(async () => {
    if (!user?.id) {
      setUserPermissions([]);
      setLoading(false);
      return;
    }
    
    // Se temos permissões em cache para este usuário e o cache é válido, usá-lo
    if (globalPermissionsCache.userPermissions.has(user.id) && isGlobalCacheValid()) {
      console.log("Usando cache para permissões do usuário");
      setUserPermissions(globalPermissionsCache.userPermissions.get(user.id) || []);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      abortPreviousRequests();
      abortControllerRef.current = new AbortController();
      
      // Verificação rápida se é admin por email (fallback primário)
      const isAdminByEmail = user.email && (
        user.email.includes('@viverdeia.ai') || 
        user.email === 'admin@teste.com' || 
        user.email === 'admin@viverdeia.ai'
      );
      
      // Se for admin por email, definir permissões completas sem consulta
      if (isAdminByEmail) {
        console.log('Usuário identificado como admin por email. Definindo permissões administrativas.');
        const adminPermissions = ['admin.all', 'users.view', 'users.manage', 'users.roles.assign', 'users.delete', 'users.reset_password'];
        
        // Atualizar cache global
        globalPermissionsCache.userPermissions.set(user.id, adminPermissions);
        
        setUserPermissions(adminPermissions);
        setLoading(false);
        return;
      }
      
      // Definir um timeout para a consulta RPC
      const timeoutPromise = new Promise<{data: string[] | null, error: Error | null}>(resolve => {
        timeoutRef.current = window.setTimeout(() => {
          console.log('Timeout atingido ao buscar permissões via RPC');
          resolve({data: null, error: new Error('Timeout ao buscar permissões')});
        }, 3000);
      });
      
      // Realizar a chamada RPC com timeout - Removendo abortSignal que não existe
      const rpcPromise = supabase.rpc('get_user_permissions', {
        user_id: user.id
      });
      
      // Usar o que retornar primeiro: a consulta ou o timeout
      const { data, error } = await Promise.race([rpcPromise, timeoutPromise]);
      
      // Limpar o timeout se a consulta retornou antes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Se o usuário é admin, ele tem todas as permissões
        const isAdmin = data.some((code: string) => code === 'admin.all');
        
        let userPerms = [...data];
        
        if (isAdmin) {
          console.log('Usuário tem permissão admin.all. Adicionando permissões específicas.');
          // Adicionar permissões específicas de admin para compatibilidade
          userPerms = [...userPerms, 'users.view', 'users.manage', 'users.roles.assign', 'users.delete', 'users.reset_password'];
        }
        
        // Atualizar cache global
        globalPermissionsCache.userPermissions.set(user.id, userPerms);
        
        setUserPermissions(userPerms);
        setLoading(false);
        return;
      }
      
      // Fallback 2: Verificar papel no perfil
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (profileData?.role === 'admin') {
          console.log('Usuário identificado como admin pelo perfil no fallback');
          const adminPermissions = ['admin.all', 'users.view', 'users.manage', 'users.roles.assign', 'users.delete', 'users.reset_password'];
          
          // Atualizar cache global
          globalPermissionsCache.userPermissions.set(user.id, adminPermissions);
          
          setUserPermissions(adminPermissions);
        } else if (profileData?.role) {
          // Para outros papéis, definir permissões básicas
          const basicPermissions = ['users.view'];
          
          // Atualizar cache global
          globalPermissionsCache.userPermissions.set(user.id, basicPermissions);
          
          setUserPermissions(basicPermissions);
        } else {
          // Sem papel definido, sem permissões
          setUserPermissions([]);
          
          // Atualizar cache global com lista vazia
          globalPermissionsCache.userPermissions.set(user.id, []);
        }
      } catch (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        // Último recurso - sem permissões
        setUserPermissions([]);
        
        // Atualizar cache global com lista vazia
        globalPermissionsCache.userPermissions.set(user.id, []);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao buscar permissões do usuário:', err);
        setError(err);
        
        // Fallback em caso de erro - verificar se é admin por email
        if (user.email && (
          user.email.includes('@viverdeia.ai') || 
          user.email === 'admin@teste.com' || 
          user.email === 'admin@viverdeia.ai'
        )) {
          const adminPermissions = ['admin.all', 'users.view', 'users.manage', 'users.roles.assign', 'users.delete', 'users.reset_password'];
          setUserPermissions(adminPermissions);
          
          // Atualizar cache global
          globalPermissionsCache.userPermissions.set(user.id, adminPermissions);
        } else {
          // Em caso de erro, definir permissões vazias
          setUserPermissions([]);
          
          // Atualizar cache global com lista vazia
          globalPermissionsCache.userPermissions.set(user.id, []);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user, isGlobalCacheValid, abortPreviousRequests]);

  // Verificar se o usuário tem determinada permissão com cache local
  const hasPermission = useCallback((permissionCode: string): boolean => {
    // Verificar se temos o resultado em cache
    const cacheKey = `${user?.id || 'anon'}-${permissionCode}`;
    if (permissionCheckCache.current.has(cacheKey)) {
      return permissionCheckCache.current.get(cacheKey) || false;
    }
    
    // Verificar se o usuário tem a permissão específica
    const hasSpecificPermission = userPermissions.includes(permissionCode);
    
    // Verificar se o usuário tem permissão admin.all (é um superadmin)
    const isAdminPerm = userPermissions.includes('admin.all');
    
    // Verificar se o usuário é admin por email (fallback)
    let isAdminByEmail = false;
    if (user?.email) {
      isAdminByEmail = user.email.includes('@viverdeia.ai') || 
                      user.email === 'admin@teste.com' ||
                      user.email === 'admin@viverdeia.ai';
    }
    
    const result = hasSpecificPermission || isAdminPerm || isAdminByEmail;
    
    // Armazenar o resultado em cache
    permissionCheckCache.current.set(cacheKey, result);
    
    return result;
  }, [userPermissions, user?.email, user?.id]);

  // Carregar dados iniciais quando o usuário mudar
  useEffect(() => {
    // Limpar cache local quando o usuário mudar
    permissionCheckCache.current.clear();
    
    fetchAllPermissions();
    fetchRoles();
    fetchUserPermissions();
    
    // Adicionando um timeout para garantir que loading nunca fique preso
    const timeoutId = window.setTimeout(() => {
      if (loading) {
        console.warn('Timeout atingido ao carregar permissões. Definindo loading como false.');
        setLoading(false);
        
        // Se não temos permissões, verificar se é admin por email
        if (userPermissions.length === 0 && user?.email) {
          const isAdmin = user.email.includes('@viverdeia.ai') || 
                         user.email === 'admin@teste.com' ||
                         user.email === 'admin@viverdeia.ai';
          
          if (isAdmin) {
            console.log('Usuário identificado como admin por email no timeout. Definindo permissões administrativas.');
            setUserPermissions(['admin.all', 'users.view', 'users.manage', 'users.roles.assign', 'users.delete', 'users.reset_password']);
          }
        }
      }
    }, 5000);
    
    return () => {
      clearTimeout(timeoutId);
      abortPreviousRequests();
    };
  }, [user?.id, fetchAllPermissions, fetchRoles, fetchUserPermissions, loading, userPermissions.length, user?.email, abortPreviousRequests]);

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
