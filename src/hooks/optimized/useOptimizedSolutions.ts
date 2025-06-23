
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase/types";
import { getUserRoleName } from "@/lib/supabase/types";

export const useOptimizedSolutions = () => {
  const { user, profile } = useAuth();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = getUserRoleName(profile) === 'admin';

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

  useEffect(() => {
    fetchSolutions();
  }, [user, isAdmin]);

  return {
    solutions,
    loading,
    error,
    refetch: fetchSolutions
  };
};
