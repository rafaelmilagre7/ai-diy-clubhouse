
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

// Cache global com tempo de expiração mais longo (30 minutos)
const globalPermissionsCache = {
  allPermissions: null as Permission[] | null,
  userPermissions: new Map<string, string[]>(),
  roles: null as Role[] | null,
  lastFetch: 0,
  // Adicionar armazenamento do status de admin para acesso mais rápido
  adminStatus: new Map<string, boolean>()
};

// Tempo de validade do cache em ms (30 minutos)
const CACHE_VALIDITY = 30 * 60 * 1000;

// Verificar se temos dados no localStorage para persistência entre sessões
const initializeFromLocalStorage = () => {
  try {
    const storedCache = localStorage.getItem('permissionsCache');
    if (storedCache) {
      const parsedCache = JSON.parse(storedCache);
      if (parsedCache && parsedCache.lastFetch && Date.now() - parsedCache.lastFetch < CACHE_VALIDITY) {
        if (parsedCache.allPermissions) {
          globalPermissionsCache.allPermissions = parsedCache.allPermissions;
        }
        if (parsedCache.roles) {
          globalPermissionsCache.roles = parsedCache.roles;
        }
        if (parsedCache.userPermissions) {
          Object.entries(parsedCache.userPermissions).forEach(([userId, permissions]) => {
            globalPermissionsCache.userPermissions.set(userId, permissions as string[]);
          });
        }
        if (parsedCache.adminStatus) {
          Object.entries(parsedCache.adminStatus).forEach(([userId, isAdmin]) => {
            globalPermissionsCache.adminStatus.set(userId, isAdmin as boolean);
          });
        }
        globalPermissionsCache.lastFetch = parsedCache.lastFetch;
        console.log('Carregou cache de permissões do localStorage');
      }
    }
  } catch (error) {
    console.error('Erro ao carregar cache de permissões do localStorage:', error);
  }
};

// Inicializar cache do localStorage
initializeFromLocalStorage();

// Função para salvar cache no localStorage
const saveToLocalStorage = () => {
  try {
    const cacheToStore = {
      allPermissions: globalPermissionsCache.allPermissions,
      roles: globalPermissionsCache.roles,
      userPermissions: Object.fromEntries(globalPermissionsCache.userPermissions.entries()),
      adminStatus: Object.fromEntries(globalPermissionsCache.adminStatus.entries()),
      lastFetch: globalPermissionsCache.lastFetch
    };
    localStorage.setItem('permissionsCache', JSON.stringify(cacheToStore));
  } catch (error) {
    console.error('Erro ao salvar cache de permissões no localStorage:', error);
  }
};

export const usePermissions = () => {
  const { user, isAdmin } = useAuth();
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

  // Buscar todas as permissões disponíveis no sistema (baixa prioridade)
  const fetchAllPermissions = useCallback(async () => {
    // Se já temos permissões em cache e o cache é válido, usá-lo
    if (globalPermissionsCache.allPermissions && isGlobalCacheValid()) {
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
      saveToLocalStorage();
      
      setPermissions(data || []);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao buscar permissões:', err);
        setError(err);
      }
    }
  }, [isGlobalCacheValid, abortPreviousRequests]);

  // Buscar os papéis disponíveis (baixa prioridade)
  const fetchRoles = useCallback(async () => {
    // Se já temos papéis em cache e o cache é válido, usá-lo
    if (globalPermissionsCache.roles && isGlobalCacheValid()) {
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
      saveToLocalStorage();
      
      setRoles(data || []);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao buscar papéis:', err);
        setError(err);
      }
    }
  }, [isGlobalCacheValid, abortPreviousRequests]);

  // Usar a nova função RPC otimizada para verificar se é admin rapidamente
  const checkIsAdmin = useCallback(async (userId: string): Promise<boolean> => {
    // Verificar se já temos o status de admin em cache
    if (globalPermissionsCache.adminStatus.has(userId)) {
      return globalPermissionsCache.adminStatus.get(userId) || false;
    }
    
    try {
      // Usar a nova função RPC otimizada
      const { data, error } = await supabase.rpc('is_user_admin', {
        user_id: userId
      });
      
      if (error) throw error;
      
      // Armazenar resultado em cache
      const isAdmin = !!data;
      globalPermissionsCache.adminStatus.set(userId, isAdmin);
      saveToLocalStorage();
      
      return isAdmin;
    } catch (err) {
      console.error('Erro ao verificar status de admin:', err);
      return false;
    }
  }, []);

  // Otimização: Verificar primeiro se o usuário é admin antes de fazer chamadas RPC
  const fetchUserPermissions = useCallback(async () => {
    if (!user?.id) {
      setUserPermissions([]);
      setLoading(false);
      return;
    }

    // Verificação rápida de admin pelos dados já disponíveis (reduz chamadas ao servidor)
    if (isAdmin) {
      const adminPermissions = ['admin.all', 'users.view', 'users.manage', 'users.roles.assign', 'users.delete', 'users.reset_password'];
      globalPermissionsCache.userPermissions.set(user.id, adminPermissions);
      saveToLocalStorage();
      setUserPermissions(adminPermissions);
      setLoading(false);
      return;
    }
    
    // Se temos permissões em cache para este usuário e o cache é válido, usá-lo
    if (globalPermissionsCache.userPermissions.has(user.id) && isGlobalCacheValid()) {
      setUserPermissions(globalPermissionsCache.userPermissions.get(user.id) || []);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      abortPreviousRequests();
      abortControllerRef.current = new AbortController();
      
      // Verificação rápida de admin usando a função RPC otimizada
      const isAdminUser = await checkIsAdmin(user.id);
      
      if (isAdminUser) {
        const adminPermissions = ['admin.all', 'users.view', 'users.manage', 'users.roles.assign', 'users.delete', 'users.reset_password'];
        globalPermissionsCache.userPermissions.set(user.id, adminPermissions);
        saveToLocalStorage();
        setUserPermissions(adminPermissions);
        setLoading(false);
        return;
      }
      
      // Verificação rápida se é admin por email (fallback primário)
      const isAdminByEmail = user.email && (
        user.email.includes('@viverdeia.ai') || 
        user.email === 'admin@teste.com' || 
        user.email === 'admin@viverdeia.ai'
      );
      
      // Se for admin por email, definir permissões completas sem consulta
      if (isAdminByEmail) {
        const adminPermissions = ['admin.all', 'users.view', 'users.manage', 'users.roles.assign', 'users.delete', 'users.reset_password'];
        
        // Atualizar cache global
        globalPermissionsCache.userPermissions.set(user.id, adminPermissions);
        saveToLocalStorage();
        
        setUserPermissions(adminPermissions);
        setLoading(false);
        return;
      }
      
      // Definir um timeout para a consulta RPC (3 segundos para permitir tempo suficiente)
      const timeoutPromise = new Promise<{data: string[] | null, error: Error | null}>(resolve => {
        timeoutRef.current = window.setTimeout(() => {
          resolve({data: null, error: new Error('Timeout ao buscar permissões')});
        }, 3000);
      });
      
      // Realizar a chamada RPC
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
        const userIsAdmin = data.some((code: string) => code === 'admin.all');
        
        let userPerms = [...data];
        
        if (userIsAdmin) {
          // Adicionar permissões específicas de admin para compatibilidade
          userPerms = [...userPerms, 'users.view', 'users.manage', 'users.roles.assign', 'users.delete', 'users.reset_password'];
          // Guardar no cache de admin status
          globalPermissionsCache.adminStatus.set(user.id, true);
        }
        
        // Atualizar cache global
        globalPermissionsCache.userPermissions.set(user.id, userPerms);
        saveToLocalStorage();
        
        setUserPermissions(userPerms);
        setLoading(false);
        return;
      }
      
      // Fallback: Verificar papel no perfil usando a view criada
      try {
        const { data: profileData } = await supabase
          .from('users_with_roles') // Usando a nova view otimizada
          .select('role_name')
          .eq('id', user.id)
          .single();
          
        if (profileData?.role_name === 'admin') {
          const adminPermissions = ['admin.all', 'users.view', 'users.manage', 'users.roles.assign', 'users.delete', 'users.reset_password'];
          
          // Atualizar cache global
          globalPermissionsCache.userPermissions.set(user.id, adminPermissions);
          globalPermissionsCache.adminStatus.set(user.id, true);
          saveToLocalStorage();
          
          setUserPermissions(adminPermissions);
        } else {
          // Para outros papéis, definir permissões básicas
          const basicPermissions = ['users.view'];
          
          // Atualizar cache global
          globalPermissionsCache.userPermissions.set(user.id, basicPermissions);
          globalPermissionsCache.adminStatus.set(user.id, false);
          saveToLocalStorage();
          
          setUserPermissions(basicPermissions);
        }
      } catch (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        // Último recurso - sem permissões
        setUserPermissions([]);
        
        // Atualizar cache global com lista vazia
        globalPermissionsCache.userPermissions.set(user.id, []);
        saveToLocalStorage();
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
          globalPermissionsCache.adminStatus.set(user.id, true);
          saveToLocalStorage();
        } else {
          // Em caso de erro, definir permissões vazias
          setUserPermissions([]);
          
          // Atualizar cache global com lista vazia
          globalPermissionsCache.userPermissions.set(user.id, []);
          saveToLocalStorage();
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, isGlobalCacheValid, abortPreviousRequests, checkIsAdmin]);

  // Verificar se o usuário tem determinada permissão com cache local
  const hasPermission = useCallback((permissionCode: string): boolean => {
    // Admin sempre tem todas as permissões
    if (isAdmin) return true;
    
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
  }, [userPermissions, user?.email, user?.id, isAdmin]);

  // Carregar dados iniciais quando o usuário mudar
  useEffect(() => {
    // Limpar cache local quando o usuário mudar
    permissionCheckCache.current.clear();
    
    // Otimização: carregar dados em sequência para evitar sobrecarga
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Primeira verificação: é admin por contexto? Se for, não precisamos de chamadas extras
        if (isAdmin) {
          const adminPermissions = ['admin.all', 'users.view', 'users.manage', 'users.roles.assign', 'users.delete', 'users.reset_password'];
          setUserPermissions(adminPermissions);
          setLoading(false);
          
          // Cacheamos mesmo assim
          if (user?.id) {
            globalPermissionsCache.userPermissions.set(user.id, adminPermissions);
            globalPermissionsCache.adminStatus.set(user.id, true);
            saveToLocalStorage();
          }
          
          // Carregamos o resto em segundo plano
          setTimeout(() => {
            fetchAllPermissions();
            fetchRoles();
          }, 2000);
          
          return;
        }
        
        // Verificação rápida: é admin por email?
        if (user?.email && (
          user.email.includes('@viverdeia.ai') || 
          user.email === 'admin@teste.com' ||
          user.email === 'admin@viverdeia.ai'
        )) {
          const adminPermissions = ['admin.all', 'users.view', 'users.manage', 'users.roles.assign', 'users.delete', 'users.reset_password'];
          setUserPermissions(adminPermissions);
          setLoading(false);
          
          // Cacheamos mesmo assim
          if (user?.id) {
            globalPermissionsCache.userPermissions.set(user.id, adminPermissions);
            globalPermissionsCache.adminStatus.set(user.id, true);
            saveToLocalStorage();
          }
          
          // Carregamos o resto em segundo plano
          setTimeout(() => {
            fetchAllPermissions();
            fetchRoles();
          }, 2000);
          
          return;
        }
        
        // Verificação rápida: temos dados em cache?
        if (user?.id && globalPermissionsCache.userPermissions.has(user.id) && isGlobalCacheValid()) {
          setUserPermissions(globalPermissionsCache.userPermissions.get(user.id) || []);
          setLoading(false);
          
          // Carregamos o resto em segundo plano
          setTimeout(() => {
            fetchAllPermissions();
            fetchRoles();
          }, 2000);
          
          return;
        }
        
        // Não temos informação em cache, buscar permissões do usuário (prioridade alta)
        await fetchUserPermissions();
        
        // Carregar os outros dados em segundo plano para não bloquear a UI
        setTimeout(() => {
          fetchAllPermissions();
          fetchRoles();
        }, 2000);
      } catch (error) {
        console.error("Erro ao carregar dados de permissões:", error);
        setLoading(false);
      }
    };
    
    loadData();
    
    // Timeout de segurança para evitar loading infinito
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
    }, 3000);
    
    return () => {
      clearTimeout(timeoutId);
      abortPreviousRequests();
    };
  }, [user?.id, fetchAllPermissions, fetchRoles, fetchUserPermissions, loading, userPermissions.length, user?.email, abortPreviousRequests, isAdmin, isGlobalCacheValid]);

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
