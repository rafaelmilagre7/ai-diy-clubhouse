
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase/types";
import { logger } from "@/utils/logger";

export const useDashboardData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);

  useEffect(() => {
    const fetchSolutions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        logger.info('[DASHBOARD] Carregando soluções');

        const { data, error: fetchError } = await supabase
          .from("solutions")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setSolutions(data || []);
        logger.info('[DASHBOARD] Soluções carregadas', { count: data?.length || 0 });

      } catch (error: any) {
        logger.error('[DASHBOARD] Erro ao carregar soluções:', error);
        setError(error.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
  }, [user]);

  return {
    solutions,
    loading,
    error
  };
};
