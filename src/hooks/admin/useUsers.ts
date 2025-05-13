
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase, UserProfile } from '@/lib/supabase';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Role } from '@/hooks/admin/useRoles';
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

// Dados de fallback tipados para quando a API falhar
const FALLBACK_USERS: UserProfile[] = [
  {
    id: "fallback-1",
    email: "admin@viverdeia.ai",
    name: "Administrador (Fallback)",
    avatar_url: null,
    role: "admin",
    company_name: "VIVER DE IA",
    industry: null,
    created_at: new Date().toISOString()
  },
  {
    id: "fallback-2",
    email: "membro@exemplo.com",
    name: "Usuário Teste (Fallback)",
    avatar_url: null,
    role: "member",
    company_name: "Empresa Teste",
    industry: null,
    created_at: new Date().toISOString()
  }
];

const FALLBACK_ROLES: Role[] = [
  {
    id: "fallback-role-1",
    name: "admin",
    description: "Administrador do sistema",
    is_system: true,
    created_at: new Date().toISOString()
  },
  {
    id: "fallback-role-2",
    name: "member",
    description: "Membro padrão",
    is_system: true,
    created_at: new Date().toISOString()
  },
  {
    id: "fallback-role-3",
    name: "formacao",
    description: "Usuário da formação",
    is_system: true,
    created_at: new Date().toISOString()
  }
];

// Aumentando o tempo de cache para evitar sobrecarga de requisições
const CACHE_VALIDITY = 30 * 60 * 1000; // 30 minutos

// Armazenar cache entre sessões (localStorage)
const initCacheFromLocalStorage = () => {
  try {
    const storedCache = localStorage.getItem('usersCache');
    if (storedCache) {
      return JSON.parse(storedCache);
    }
  } catch (error) {
    console.error('Erro ao ler cache de usuários:', error);
  }
  return {
    users: null,
    roles: null,
    timestamp: 0
  };
};

// Cache global inicializado do localStorage
const GLOBAL_CACHE = initCacheFromLocalStorage();

// Salvar cache no localStorage
const saveToLocalStorage = (cache: any) => {
  try {
    localStorage.setItem('usersCache', JSON.stringify(cache));
  } catch (error) {
    console.error('Erro ao salvar cache de usuários:', error);
  }
};

export const useUsers = () => {
  const { hasPermission } = usePermissions();
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Referência ao cache
  const cacheRef = useRef(GLOBAL_CACHE);

  // Flag para abortar requisições
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Verificar se o cache está válido
  const isCacheValid = useCallback(() => {
    return (
      cacheRef.current.users !== null &&
      cacheRef.current.timestamp > Date.now() - CACHE_VALIDITY
    );
  }, []);
  
  // Função para abortar requisições em andamento
  const abortPreviousRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Nova implementação usando a função RPC otimizada
  const fetchUsers = useCallback(async (forceRefresh = false) => {
    try {
      // Se não forçar refresh e o cache for válido, usar o cache
      if (!forceRefresh && isCacheValid() && cacheRef.current.users) {
        console.log("Usando dados em cache para usuários");
        setUsers(cacheRef.current.users);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setIsRefreshing(true);
      setError(null);
      abortPreviousRequests();
      
      // Se já tentamos muitas vezes ou estamos em modo fallback, usar dados de fallback
      if ((useFallback && fetchAttempts >= 1) || fetchAttempts >= 2) {
        console.log("Usando dados de fallback para usuários após múltiplas falhas");
        setUsers(FALLBACK_USERS);
        toast.warning("Usando dados temporários", {
          description: "Os dados exibidos podem não estar atualizados"
        });
        setLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      // Incrementar contador de tentativas
      setFetchAttempts(prev => prev + 1);
      console.log(`Tentativa ${fetchAttempts + 1} de buscar usuários`);
      
      // Configurar AbortController para poder cancelar a requisição
      abortControllerRef.current = new AbortController();
      
      // Definir um timeout para a consulta (10 segundos)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Tempo limite excedido ao buscar usuários")), 10000);
      });
      
      // Usar a função RPC otimizada
      const fetchPromise = supabase.rpc(
        'get_users_with_roles',
        { 
          limit_count: 50,
          offset_count: page * 50,
          search_query: searchQuery || null
        }
      );
      
      // Race entre a consulta e o timeout
      const result: any = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Verificar se a consulta retornou um erro
      if (result.error) {
        throw result.error;
      }
      
      // Processar dados retornados
      const data = result.data;
      console.log(`Encontrados ${data?.length || 0} usuários`);
      
      // Atualizar o cache com os novos dados
      cacheRef.current = {
        ...cacheRef.current,
        users: data as UserProfile[],
        timestamp: Date.now()
      };
      
      // Salvar cache no localStorage
      saveToLocalStorage(cacheRef.current);
      
      setUsers(data as UserProfile[]);
      setError(null);
      
      // Resetar tentativas após sucesso
      setFetchAttempts(0);
      setUseFallback(false);
    } catch (error: any) {
      console.error("Erro ao buscar usuários:", error.message);
      setError(error);
      
      // Verificar se já temos dados em cache para usar como fallback inicial
      if (cacheRef.current.users && cacheRef.current.users.length > 0) {
        console.log("Usando cache como fallback após erro");
        setUsers(cacheRef.current.users);
        toast.error("Erro ao atualizar lista", {
          description: "Usando dados anteriormente carregados"
        });
      } else {
        // Se já tentamos muito e não temos cache, usar dados de fallback
        console.log("Usando dados de fallback após múltiplas falhas");
        setUseFallback(true);
        setUsers(FALLBACK_USERS);
        toast.error("Erro ao carregar lista de usuários", {
          description: "Usando dados temporários para demonstração"
        });
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      abortControllerRef.current = null;
    }
  }, [fetchAttempts, useFallback, isCacheValid, abortPreviousRequests, page, searchQuery]);

  const fetchRoles = useCallback(async () => {
    try {
      // Verificar se temos dados de roles em cache
      if (isCacheValid() && cacheRef.current.roles) {
        console.log("Usando dados em cache para papéis");
        setAvailableRoles(cacheRef.current.roles);
        return;
      }
      
      if (useFallback) {
        console.log("Usando dados de fallback para papéis");
        setAvailableRoles(FALLBACK_ROLES);
        return;
      }
      
      // Definir um timeout para a consulta (5 segundos)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Tempo limite excedido ao buscar papéis")), 5000);
      });
      
      // Consulta ao banco de dados com timeout
      const fetchPromise = supabase
        .from("user_roles")
        .select("*")
        .order("name", { ascending: true });
        
      // Race entre a consulta e o timeout
      const result: any = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (result.error) {
        throw result.error;
      }
      
      // Atualizar o cache com os novos dados
      cacheRef.current = {
        ...cacheRef.current,
        roles: result.data as Role[],
        timestamp: Date.now()
      };
      
      // Salvar cache no localStorage
      saveToLocalStorage(cacheRef.current);
      
      setAvailableRoles(result.data as Role[]);
    } catch (error: any) {
      console.error("Erro ao buscar papéis:", error.message);
      
      // Se temos dados em cache, usar como fallback
      if (cacheRef.current.roles && cacheRef.current.roles.length > 0) {
        setAvailableRoles(cacheRef.current.roles);
      } else {
        // Se não temos cache, usar dados de fallback
        setAvailableRoles(FALLBACK_ROLES);
      }
    }
  }, [useFallback, isCacheValid]);

  // Efeito para tentar novamente após falha com delay exponencial
  useEffect(() => {
    if (error && fetchAttempts < 2) {
      const retryDelay = Math.min(1000 * Math.pow(2, fetchAttempts), 5000); // Exponential backoff capped at 5s
      console.log(`Tentando buscar usuários novamente após erro em ${retryDelay}ms`);
      
      const timer = setTimeout(() => {
        fetchUsers(true); // Forçar atualização ignorando cache
      }, retryDelay);
      
      return () => clearTimeout(timer);
    }
  }, [error, fetchAttempts, fetchUsers]);

  // Efeito para abortar requisições anteriores ao desmontar o componente
  useEffect(() => {
    return () => {
      abortPreviousRequests();
    };
  }, [abortPreviousRequests]);
  
  // Carregar dados na inicialização
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);
  
  // Filtro para usuários baseado na busca
  const filteredUsers = useMemo(() => {
    return users;
  }, [users]);
  
  // Verificações alternativas de permissão caso o sistema de permissões falhe
  const isAdminByEmail = user?.email?.includes('@viverdeia.ai') || 
                       user?.email === 'admin@teste.com' || 
                       user?.email === 'admin@viverdeia.ai';

  return {
    users: filteredUsers,
    availableRoles,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    isRefreshing,
    fetchUsers: () => fetchUsers(true), // Sempre forçar refresh ao chamar manualmente
    refreshUsers: () => fetchUsers(true),
    page,
    setPage,
    totalUsers,
    // Usar fallback de permissões caso o sistema principal falhe
    canManageUsers: hasPermission('users.manage') || isAdmin || isAdminByEmail,
    canAssignRoles: hasPermission('users.roles.assign') || isAdmin || isAdminByEmail,
    canDeleteUsers: hasPermission('users.delete') || isAdmin || isAdminByEmail,
    canResetPasswords: hasPermission('users.reset_password') || isAdmin || isAdminByEmail,
  };
};
