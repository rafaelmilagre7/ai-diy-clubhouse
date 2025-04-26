
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { Solution } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { TrailCardLoader } from "./TrailCardLoader";
import { TrailEmptyState } from "./TrailEmptyState";
import { TrailCardList } from "./TrailCardList";
import { TrailCardHeader } from "./TrailCardHeader";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

interface TrailSolution extends Solution {
  priority: number;
  justification: string;
}

export const ImplementationTrail = () => {
  const navigate = useNavigate();
  const { trail, isLoading, hasContent, refreshTrail, generateImplementationTrail } = useImplementationTrail();
  const [solutions, setSolutions] = useState<TrailSolution[]>([]);
  const [loadingSolutions, setLoadingSolutions] = useState(false);
  const queryClient = useQueryClient();
  
  // Cache de soluções para uso imediato
  const cachedSolutions = useMemo(() => {
    return queryClient.getQueryData<TrailSolution[]>(['trail-solutions']) || [];
  }, [queryClient]);

  // Usar cache imediatamente enquanto carrega novos dados
  useEffect(() => {
    if (cachedSolutions.length > 0) {
      setSolutions(cachedSolutions);
    }
  }, [cachedSolutions]);

  useEffect(() => {
    const fetchSolutionsForTrail = async () => {
      if (!trail) {
        setLoadingSolutions(false);
        return;
      }

      try {
        if (!loadingSolutions) setLoadingSolutions(true);
        
        const solutionIds = [
          ...trail.priority1.map(r => r.solutionId),
          ...trail.priority2.map(r => r.solutionId),
          ...trail.priority3.map(r => r.solutionId)
        ];

        if (solutionIds.length === 0) {
          setSolutions([]);
          setLoadingSolutions(false);
          return;
        }

        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .in("id", solutionIds);

        if (error) throw error;

        const mappedSolutions: TrailSolution[] = [];

        trail.priority1.forEach(rec => {
          const solution = data?.find(s => s.id === rec.solutionId);
          if (solution) {
            mappedSolutions.push({
              ...solution,
              priority: 1,
              justification: rec.justification
            });
          }
        });

        trail.priority2.forEach(rec => {
          const solution = data?.find(s => s.id === rec.solutionId);
          if (solution) {
            mappedSolutions.push({
              ...solution,
              priority: 2,
              justification: rec.justification
            });
          }
        });

        trail.priority3.forEach(rec => {
          const solution = data?.find(s => s.id === rec.solutionId);
          if (solution) {
            mappedSolutions.push({
              ...solution,
              priority: 3,
              justification: rec.justification
            });
          }
        });

        // Atualizar o estado e o cache para uso futuro
        setSolutions(mappedSolutions);
        queryClient.setQueryData(['trail-solutions'], mappedSolutions);
        
      } catch (error) {
        console.error("Erro ao buscar soluções para a trilha:", error);
      } finally {
        setLoadingSolutions(false);
      }
    };

    fetchSolutionsForTrail();
  }, [trail, queryClient]);

  const handleRegenerateTrail = async () => {
    // Passamos um objeto vazio como parâmetro para atender à assinatura da função
    await generateImplementationTrail({});
  };

  const handleSolutionClick = (id: string) => {
    // Pré-carregar dados da solução antes de navegar
    queryClient.prefetchQuery({
      queryKey: ['solution', id],
      queryFn: async () => {
        const { data } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .single();
        return data;
      },
      staleTime: 5 * 60 * 1000 // 5 minutos
    });

    navigate(`/solution/${id}`);
  };

  // Mostrar skeleton individual apenas se NÃO tivermos dados em cache
  if ((isLoading || loadingSolutions) && solutions.length === 0) {
    return <TrailCardLoader />;
  }

  if (!hasContent && solutions.length === 0) {
    return <TrailEmptyState onRegenerate={handleRegenerateTrail} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="w-full">
        <TrailCardHeader onUpdate={handleRegenerateTrail} />
        <CardContent>
          <TrailCardList
            solutions={solutions}
            onSolutionClick={handleSolutionClick}
            onSeeAll={() => navigate('/solutions')}
            isLoading={loadingSolutions && solutions.length === 0}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};
