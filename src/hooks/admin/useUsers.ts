
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

// Aumentando o tempo de cache para 12 horas para reduzir requisições
const CACHE_VALIDITY = 12 * 60 * 60 * 1000; // 12 horas

// Função para salvar cache com timestamp
const saveCache = (key: string, data: any) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error(`Erro ao salvar cache para ${key}:`, error);
  }
};

// Função para recuperar cache se válido
const getCache = (key: string) => {
  try {
    const cacheJson = localStorage.getItem(key);
    if (!cacheJson) return null;
    
    const cache = JSON.parse(cacheJson);
    if (Date.now() - cache.timestamp < CACHE_VALIDITY) {
      return cache.data;
    }
  } catch (error) {
    console.error(`Erro ao recuperar cache para ${key}:`, error);
  }
  return null;
};

export const useUsers = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Flag para abortar requisições
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Função para abortar requisições em andamento
  const abortPreviousRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Implementação otimizada para buscar usuários
  const fetchUsers = useCallback(async (forceRefresh = false) => {
    try {
      // Se não estamos forçando refresh e já temos dados iniciais, não bloquear a UI
      if (!forceRefresh && initialLoadComplete) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      abortPreviousRequests();
      
      // Verificar o cache primeiro (exceto se forçar refresh)
      if (!forceRefresh) {
        const cachedUsers = getCache('usersData');
        if (cachedUsers && cachedUsers.length > 0) {
          console.log("Usando dados em cache para usuários");
          setUsers(cachedUsers);
          
          if (!initialLoadComplete) {
            setInitialLoadComplete(true);
            setLoading(false);
          }
          
          // Se temos cache, podemos continuar para buscar dados atualizados em segundo plano
          // sem bloquear a UI
        }
      }
      
      // Configurar AbortController para poder cancelar a requisição
      abortControllerRef.current = new AbortController();
      
      // Definir um timeout para a consulta (8 segundos)
      const timeoutPromise = new Promise<any>((_, reject) => {
        setTimeout(() => reject(new Error("Tempo limite excedido ao buscar usuários")), 8000);
      });
      
      // Chamar a função RPC otimizada
      const fetchPromise = supabase.rpc(
        'get_users_with_roles',
        { 
          limit_count: 50,
          offset_count: page * 50,
          search_query: searchQuery || null
        }
      );
      
      // Race entre a consulta e o timeout
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Verificar se a consulta retornou um erro
      if (result.error) {
        throw result.error;
      }
      
      const usersData = result.data as UserProfile[];
      
      // Atualizar o cache com os novos dados
      if (usersData && usersData.length > 0) {
        saveCache('usersData', usersData);
      }
      
      // Se ainda não tínhamos dados, atualizar diretamente
      // Se já tínhamos dados do cache, atualizar sem causar flash de UI
      setUsers(usersData);
      setError(null);
      setFetchAttempts(0); // Resetar tentativas após sucesso
      setInitialLoadComplete(true);
    } catch (error: any) {
      console.error("Erro ao buscar usuários:", error.message);
      
      // Incrementar contador de tentativas
      setFetchAttempts(prev => prev + 1);
      
      // Se esse foi o primeiro carregamento (não temos dados ainda),
      // tentar usar o cache como último recurso
      if (!initialLoadComplete) {
        const cachedUsers = getCache('usersData');
        
        if (cachedUsers && cachedUsers.length > 0) {
          console.log("Erro na API, usando cache local como fallback");
          setUsers(cachedUsers);
          setInitialLoadComplete(true);
          toast.warning("Usando dados em cache", {
            description: "Não foi possível atualizar a lista de usuários"
          });
        } else {
          // Se não temos cache, usar dados de fallback
          setError(error);
          setUsers(FALLBACK_USERS);
          setInitialLoadComplete(true);
          
          toast.error("Erro ao carregar usuários", {
            description: "Usando dados de exemplo para demonstração"
          });
        }
      } else {
        // Se já tínhamos dados e estávamos apenas atualizando, manter os dados existentes
        setError(error);
        
        toast.error("Erro ao atualizar lista de usuários", {
          description: "Mantendo dados já carregados"
        });
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      abortControllerRef.current = null;
    }
  }, [abortPreviousRequests, initialLoadComplete, page, searchQuery]);

  // Função otimizada para buscar papéis
  const fetchRoles = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cachedRoles = getCache('rolesData');
        if (cachedRoles && cachedRoles.length > 0) {
          console.log("Usando dados em cache para papéis");
          setAvailableRoles(cachedRoles);
          return; // Saída rápida, sem bloquear
        }
      }
      
      // Definir um timeout para a consulta (3 segundos)
      const timeoutPromise = new Promise<any>((_, reject) => {
        setTimeout(() => reject(new Error("Tempo limite excedido ao buscar papéis")), 3000);
      });
      
      // Consulta ao banco de dados com timeout
      const fetchPromise = supabase
        .from("user_roles")
        .select("*")
        .order("name", { ascending: true });
        
      // Race entre a consulta e o timeout
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (result.error) {
        throw result.error;
      }
      
      const rolesData = result.data as Role[];
      
      // Atualizar o cache com os novos dados
      if (rolesData && rolesData.length > 0) {
        saveCache('rolesData', rolesData);
        setAvailableRoles(rolesData);
      }
    } catch (error: any) {
      console.error("Erro ao buscar papéis:", error.message);
      
      // Tentar usar o cache como fallback
      const cachedRoles = getCache('rolesData');
      if (cachedRoles && cachedRoles.length > 0) {
        setAvailableRoles(cachedRoles);
      } else {
        setAvailableRoles(FALLBACK_ROLES);
      }
    }
  }, []);

  // Efeito para tentar novamente com backoff exponencial
  useEffect(() => {
    if (error && fetchAttempts < 3) {
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
  
  // Loading lazy - só disparar fetchRoles depois que users terminar
  useEffect(() => {
    if (initialLoadComplete && !isRefreshing) {
      fetchRoles(false);
    }
  }, [initialLoadComplete, isRefreshing, fetchRoles]);
  
  // Carregar dados na inicialização
  useEffect(() => {
    console.log("useUsers hook inicializado");
    fetchUsers(false);
    
    // Registrar evento na analytics para diagnóstico
    try {
      // Simples timestamp para debug
      localStorage.setItem('lastUsersLoad', JSON.stringify({
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      }));
    } catch (e) {
      // Ignorar erros
    }
    
    return () => {
      console.log("useUsers hook desmontado");
      abortPreviousRequests();
    };
  }, [fetchUsers, abortPreviousRequests]);
  
  // Recarregar quando a página ou busca mudar
  useEffect(() => {
    // Não recarregar imediatamente na montagem inicial
    if (initialLoadComplete) {
      fetchUsers(false);
    }
  }, [page, searchQuery, fetchUsers, initialLoadComplete]);

  return {
    users,
    availableRoles,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    isRefreshing,
    fetchUsers: useCallback(() => fetchUsers(true), [fetchUsers]), // Sempre forçar refresh ao chamar manualmente
    refreshUsers: useCallback(() => fetchUsers(true), [fetchUsers]),
    page,
    setPage,
    totalUsers,
    // Status de permissões simplificados - confiando no isAdmin do contexto
    canManageUsers: isAdmin,
    canAssignRoles: isAdmin,
    canDeleteUsers: isAdmin,
    canResetPasswords: isAdmin,
  };
};
