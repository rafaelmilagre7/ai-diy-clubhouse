
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { Solution } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { TrailCardLoader } from "./TrailCardLoader";
import { TrailEmptyState } from "./TrailEmptyState";
import { TrailCardList } from "./TrailCardList";

interface TrailSolution extends Solution {
  priority: number;
  justification: string;
}

export const ImplementationTrail = () => {
  const navigate = useNavigate();
  const { trail, isLoading, generateImplementationTrail } = useImplementationTrail();
  const [solutions, setSolutions] = useState<TrailSolution[]>([]);
  const [loadingSolutions, setLoadingSolutions] = useState(true);

  // Carregar trilha e soluções correspondentes
  useEffect(() => {
    const fetchSolutionsForTrail = async () => {
      if (!trail) {
        setLoadingSolutions(false);
        return;
      }

      try {
        setLoadingSolutions(true);
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

        setSolutions(mappedSolutions);
      } catch (error) {
        console.error("Erro ao buscar soluções para a trilha:", error);
      } finally {
        setLoadingSolutions(false);
      }
    };

    fetchSolutionsForTrail();
  }, [trail]);

  const handleRegenerateTrail = async () => {
    await generateImplementationTrail();
  };

  const handleSolutionClick = (id: string) => {
    navigate(`/solution/${id}`);
  };

  if (isLoading || loadingSolutions) {
    return <TrailCardLoader />;
  }

  if (!trail || solutions.length === 0) {
    return <TrailEmptyState onRegenerate={handleRegenerateTrail} />;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Sua Trilha de Implementação</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerateTrail}
            className="text-xs text-[#0ABAB5] hover:text-[#0ABAB5]/80"
          >
            Atualizar
          </Button>
        </CardTitle>
        <CardDescription>
          Soluções personalizadas com base no seu perfil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TrailCardList
          solutions={solutions}
          onSolutionClick={handleSolutionClick}
          onSeeAll={() => navigate('/solutions')}
        />
      </CardContent>
    </Card>
  );
};
