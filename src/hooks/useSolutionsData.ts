
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase/types";
import { getUserRoleName } from "@/lib/supabase/types";

export const useSolutionsData = () => {
  const { user, profile } = useAuth();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = getUserRoleName(profile) === 'admin';

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from("solutions")
          .select("*")
          .order("created_at", { ascending: false });

        // Se não for admin, mostrar apenas soluções publicadas
        if (!isAdmin) {
          query = query.eq("published", true);
        }

        const { data, error } = await query;

        if (error) throw error;

        setSolutions((data as any) || []);
      } catch (err: any) {
        console.error("Error fetching solutions:", err);
        setError(err.message || "Erro ao carregar soluções");
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
  }, [user, isAdmin]);

  // Filtrar soluções por categoria se não for admin
  const getFilteredSolutions = (category?: string) => {
    let filtered = solutions;
    
    if (!isAdmin) {
      filtered = solutions.filter(solution => solution.published);
    }
    
    if (category) {
      filtered = filtered.filter(solution => solution.category === category);
    }
    
    return filtered;
  };

  // Buscar soluções por termo se não for admin
  const searchSolutions = (searchTerm: string) => {
    let filtered = solutions;
    
    if (!isAdmin) {
      filtered = solutions.filter(solution => solution.published);
    }
    
    return filtered.filter(solution =>
      solution.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solution.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return {
    solutions,
    loading,
    error,
    isAdmin,
    getFilteredSolutions,
    searchSolutions,
    refetch: () => {
      setLoading(true);
      // Trigger useEffect
    }
  };
};
