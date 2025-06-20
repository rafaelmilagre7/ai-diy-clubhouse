
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  role: string;
  role_id: string;
  user_roles: {
    id: string;
    name: string;
    description: string;
  } | null;
  company_name: string;
  industry: string;
  created_at: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('get_users_with_roles', {
        limit_count: 100,
        offset_count: 0,
        search_query: searchQuery || null
      });

      if (error) throw error;

      setUsers((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Ocorreu um erro ao carregar a lista de usuários.",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, toast]);

  const searchUsers = (query: string) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    fetchUsers,
    searchUsers,
    searchQuery
  };
};
