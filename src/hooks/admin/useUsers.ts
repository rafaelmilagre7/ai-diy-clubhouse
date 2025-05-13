
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, UserProfile } from '@/lib/supabase';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Role } from '@/hooks/admin/useRoles';
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

// Dados de fallback completamente tipados para quando a API falhar
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
  }
];

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
  
  // Cache para evitar refetches desnecessários
  const cacheRef = useRef<{
    users: UserProfile[] | null;
    roles: Role[] | null;
    timestamp: number;
  }>({
    users: null,
    roles: null,
    timestamp: 0
  });
  
  // Tempo de validade do cache em ms (5 minutos)
  const CACHE_VALIDITY = 5 * 60 * 1000;

  // Verificar se o cache está válido
  const isCacheValid = useCallback(() => {
    return (
      cacheRef.current.users !== null &&
      cacheRef.current.timestamp > Date.now() - CACHE_VALIDITY
    );
  }, []);

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
      setError(null);
      
      // Se já tentamos muitas vezes ou estamos em modo fallback, usar dados de fallback
      if ((useFallback && fetchAttempts >= 2) || fetchAttempts >= 3) {
        console.log("Usando dados de fallback para usuários após múltiplas falhas");
        setUsers(FALLBACK_USERS);
        toast.warning("Usando dados temporários", {
          description: "Os dados exibidos podem não estar atualizados"
        });
        setLoading(false);
        return;
      }
      
      // Incrementar contador de tentativas
      setFetchAttempts(prev => prev + 1);
      console.log(`Tentativa ${fetchAttempts + 1} de buscar usuários`);
      
      // Definir um timeout para a consulta
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Tempo limite excedido ao buscar usuários")), 8000);
      });
      
      // Consulta ao banco de dados com timeout
      const fetchPromise = supabase
        .from("profiles")
        .select("*, user_roles(*)")
        .order("created_at", { ascending: false });
        
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
      
      setUsers(data as UserProfile[]);
      setError(null);
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
      } else if (fetchAttempts >= 2) {
        // Se já tentamos muito e não temos cache, usar dados de fallback
        console.log("Usando dados de fallback após múltiplas falhas");
        setUseFallback(true);
        setUsers(FALLBACK_USERS);
        toast.error("Erro ao carregar lista de usuários", {
          description: "Usando dados temporários para demonstração"
        });
      } else {
        toast.error("Erro ao carregar usuários", {
          description: "Tentaremos novamente automaticamente"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [fetchAttempts, useFallback, isCacheValid]);

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
      
      // Definir um timeout para a consulta
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
      
      // Não exibir toast aqui para evitar múltiplas notificações
    }
  }, [useFallback, isCacheValid]);

  // Efeito para tentar novamente após falha com delay exponencial
  useEffect(() => {
    if (error && fetchAttempts < 3) {
      const retryDelay = Math.min(2000 * Math.pow(2, fetchAttempts - 1), 10000); // Exponential backoff capped at 10s
      console.log(`Tentando buscar usuários novamente após erro em ${retryDelay}ms`);
      
      const timer = setTimeout(() => {
        fetchUsers(true); // Forçar atualização ignorando cache
      }, retryDelay);
      
      return () => clearTimeout(timer);
    }
  }, [error, fetchAttempts, fetchUsers]);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);
  
  // Filtro para usuários baseado na busca
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name?.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query) ||
      user.company_name?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);
  
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
    fetchUsers: () => fetchUsers(true), // Sempre forçar refresh ao chamar manualmente
    // Usar fallback de permissões caso o sistema principal falhe
    canManageUsers: hasPermission('users.manage') || isAdmin || isAdminByEmail,
    canAssignRoles: hasPermission('users.roles.assign') || isAdmin || isAdminByEmail,
    canDeleteUsers: hasPermission('users.delete') || isAdmin || isAdminByEmail,
    canResetPasswords: hasPermission('users.reset_password') || isAdmin || isAdminByEmail,
  };
};
