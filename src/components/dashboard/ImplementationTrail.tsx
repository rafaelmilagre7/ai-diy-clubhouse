
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lightbulb, Clock } from "lucide-react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { Skeleton } from "@/components/ui/skeleton";
import { Solution } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

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
        
        // Obter todos os IDs de soluções da trilha
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
        
        // Buscar todas as soluções de uma vez
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .in("id", solutionIds);
          
        if (error) throw error;
        
        // Mapear soluções com suas prioridades e justificativas
        const mappedSolutions: TrailSolution[] = [];
        
        // Mapear soluções de prioridade 1
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
        
        // Mapear soluções de prioridade 2
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
        
        // Mapear soluções de prioridade 3
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

  const navigateToSolution = (id: string) => {
    navigate(`/solution/${id}`);
  };

  // Mostrar estados de carregamento
  if (isLoading || loadingSolutions) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Sua Trilha de Implementação</CardTitle>
          <CardDescription>
            Soluções personalizadas para o seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mostrar quando não há trilha ou não há soluções
  if (!trail || solutions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Sua Trilha de Implementação</CardTitle>
          <CardDescription>
            Soluções personalizadas para o seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 space-y-4">
            <Lightbulb className="h-12 w-12 mx-auto text-[#0ABAB5]" />
            <p className="text-gray-600">
              Ainda não foi possível gerar uma trilha personalizada para você.
            </p>
            <Button 
              onClick={handleRegenerateTrail} 
              className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
            >
              Gerar Trilha Personalizada
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrar para mostrar apenas as 5 primeiras soluções recomendadas, priorizando por ordem de prioridade
  const topSolutions = solutions
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5);

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
        <div className="space-y-4">
          {topSolutions.map((solution) => (
            <div 
              key={solution.id} 
              className="border rounded-lg p-4 hover:border-[#0ABAB5] transition-all cursor-pointer"
              onClick={() => navigateToSolution(solution.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white
                  ${solution.priority === 1 ? 'bg-green-500' : solution.priority === 2 ? 'bg-blue-500' : 'bg-purple-500'}
                `}>
                  {solution.priority}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{solution.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {solution.justification}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>
                      {solution.estimated_time 
                        ? `${solution.estimated_time} minutos para implementar` 
                        : 'Implementação rápida'}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-[#0ABAB5]" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/solutions')}
            className="text-[#0ABAB5] border-[#0ABAB5] hover:bg-[#0ABAB5]/10"
          >
            Ver todas as soluções
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
