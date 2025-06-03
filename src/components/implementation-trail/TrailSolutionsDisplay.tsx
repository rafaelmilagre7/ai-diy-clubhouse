
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImplementationTrail } from "@/types/implementation-trail";

interface TrailSolutionsDisplayProps {
  trail: ImplementationTrail;
}

interface EnrichedSolution {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  priority: number;
  justification: string;
  thumbnail_url?: string;
}

export const TrailSolutionsDisplay: React.FC<TrailSolutionsDisplayProps> = ({ trail }) => {
  const navigate = useNavigate();
  const [solutions, setSolutions] = useState<EnrichedSolution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolutions = async () => {
      if (!trail) return;

      try {
        setLoading(true);
        
        // Coletar todos os IDs de soluções
        const allSolutionIds = [
          ...trail.priority1.map(s => s.solutionId),
          ...trail.priority2.map(s => s.solutionId),
          ...trail.priority3.map(s => s.solutionId)
        ];

        if (allSolutionIds.length === 0) {
          setSolutions([]);
          return;
        }

        console.log('Buscando soluções para IDs:', allSolutionIds);

        // Buscar detalhes das soluções
        const { data: solutionsData, error } = await supabase
          .from('solutions')
          .select('*')
          .in('id', allSolutionIds)
          .eq('published', true);

        if (error) {
          console.error('Erro ao buscar soluções:', error);
          return;
        }

        console.log('Soluções encontradas:', solutionsData);

        // Enriquecer com dados da trilha
        const enrichedSolutions: EnrichedSolution[] = [];

        // Priority 1
        trail.priority1.forEach(item => {
          const solution = solutionsData?.find(s => s.id === item.solutionId);
          if (solution) {
            enrichedSolutions.push({
              ...solution,
              priority: 1,
              justification: item.justification || 'Prioridade alta para seu negócio'
            });
          }
        });

        // Priority 2
        trail.priority2.forEach(item => {
          const solution = solutionsData?.find(s => s.id === item.solutionId);
          if (solution) {
            enrichedSolutions.push({
              ...solution,
              priority: 2,
              justification: item.justification || 'Prioridade média para seu negócio'
            });
          }
        });

        // Priority 3
        trail.priority3.forEach(item => {
          const solution = solutionsData?.find(s => s.id === item.solutionId);
          if (solution) {
            enrichedSolutions.push({
              ...solution,
              priority: 3,
              justification: item.justification || 'Solução complementar'
            });
          }
        });

        console.log('Soluções enriquecidas:', enrichedSolutions);
        setSolutions(enrichedSolutions);
      } catch (error) {
        console.error('Erro ao processar soluções da trilha:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
  }, [trail]);

  const getPriorityInfo = (priority: number) => {
    switch (priority) {
      case 1:
        return {
          label: "Alta Prioridade",
          color: "bg-[#0ABAB5] text-white",
          description: "Implementar primeiro"
        };
      case 2:
        return {
          label: "Prioridade Média",
          color: "bg-amber-500 text-white",
          description: "Implementar em seguida"
        };
      case 3:
        return {
          label: "Complementar",
          color: "bg-neutral-500 text-white",
          description: "Implementar por último"
        };
      default:
        return {
          label: "Padrão",
          color: "bg-neutral-600 text-white",
          description: "Solução adicional"
        };
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'advanced': return 'Avançado';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-viverblue" />
        <span className="ml-2 text-neutral-400">Carregando soluções...</span>
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-400">Nenhuma solução encontrada na trilha.</p>
      </div>
    );
  }

  // Agrupar por prioridade
  const priority1 = solutions.filter(s => s.priority === 1);
  const priority2 = solutions.filter(s => s.priority === 2);
  const priority3 = solutions.filter(s => s.priority === 3);

  const renderSolutionGroup = (solutions: EnrichedSolution[], priority: number) => {
    if (solutions.length === 0) return null;

    const priorityInfo = getPriorityInfo(priority);

    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge className={`${priorityInfo.color} px-3 py-1`}>
            {priorityInfo.label}
          </Badge>
          <span className="text-sm text-neutral-400">{priorityInfo.description}</span>
        </div>

        <div className="space-y-3">
          {solutions.map((solution) => (
            <Card 
              key={solution.id} 
              className="bg-[#151823]/80 border-neutral-700/50 hover:border-viverblue/50 transition-all cursor-pointer"
              onClick={() => navigate(`/solution/${solution.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {solution.thumbnail_url ? (
                    <img
                      src={solution.thumbnail_url}
                      alt={solution.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-viverblue/20 flex items-center justify-center">
                      <span className="text-viverblue font-bold text-lg">
                        {solution.title.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white truncate">
                        {solution.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {getDifficultyLabel(solution.difficulty)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-neutral-300 line-clamp-2 mb-2">
                      {solution.description}
                    </p>
                    
                    <p className="text-xs text-viverblue">
                      {solution.justification}
                    </p>
                  </div>

                  <ChevronRight className="h-5 w-5 text-neutral-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderSolutionGroup(priority1, 1)}
      {renderSolutionGroup(priority2, 2)}
      {renderSolutionGroup(priority3, 3)}
    </div>
  );
};
