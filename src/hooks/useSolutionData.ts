
/**
 * 🔒 MÓDULO APROVADO - Hook de Dados de Soluções
 * Status: Produção Estável ✅
 * Função: Gerencia carregamento e estado de soluções individuais
 * 
 * ⚠️ MUDANÇAS NESTE ARQUIVO PODEM AFETAR:
 * - Carregamento de soluções para usuários
 * - Verificação de permissões admin vs member
 * - Sistema de progresso do usuário
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { supabase, Solution } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";

export const useSolutionData = (id: string | undefined) => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { showError } = useToastModern();
  const navigate = useNavigate();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<string | null>(null);
  
  const isAdmin = useMemo(() => profile?.user_roles?.name === 'admin', [profile?.user_roles?.name]);

  useEffect(() => {
    if (!id || authLoading || fetchedRef.current === id) {
      if (!id) setLoading(false);
      return;
    }

    const fetchSolution = async () => {
      try {
        setLoading(true);
        fetchedRef.current = id;
        
        let query = supabase
          .from("solutions")
          .select("*")
          .eq("id", id);
          
        // Se não for um admin, só mostra soluções publicadas
        if (!isAdmin) {
          query = query.eq("published", true);
        }
        
        const { data, error: fetchError } = await query.maybeSingle();
        
        if (fetchError) {
          console.error("Erro ao buscar solução:", fetchError);
          
          if (fetchError.code === "PGRST116" && !isAdmin) {
            showError("Solução não disponível", "Esta solução não está disponível no momento.");
            navigate("/solutions");
            return;
          }
          
          throw fetchError;
        }
        
        if (data) {
          setSolution(data as Solution);
          
          // Fetch progress if user is authenticated
          if (user) {
            try {
              const { data: progressData, error: progressError } = await supabase
                .from("progress")
                .select("*")
                .eq("solution_id", id)
                .eq("user_id", user.id)
                .maybeSingle();
                
              if (!progressError && progressData) {
                setProgress(progressData);
              }
            } catch (progressFetchError) {
              console.error("Erro ao buscar progresso:", progressFetchError);
            }
          }
        } else {
          setError("Solução não encontrada");
          showError("Solução não encontrada", "Não foi possível encontrar a solução solicitada.");
        }
      } catch (error: any) {
        console.error("Erro em useSolutionData:", error);
        setError(error.message || "Erro ao buscar a solução");
        showError("Erro ao carregar solução", error.message || "Não foi possível carregar os dados da solução.");
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [id, isAdmin, authLoading, user?.id]); // Removidas dependências problemáticas

  return {
    solution,
    setSolution,
    loading,
    error,
    progress
  };
};
