
import { Button } from "@/components/ui/button";
import { TrailSolutionCard } from "./TrailSolutionCard";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface Solution {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  category: string;
  difficulty: string;
  tags?: string[];
}

interface TrailSolution {
  solutionId: string;
  justification: string;
  priority: number;
  solution?: Solution;
}

interface TrailCardListProps {
  solutions: TrailSolution[];
  onSolutionClick: (id: string) => void;
  onSeeAll: () => void;
  isLoading?: boolean;
}

export function TrailCardList({ solutions, onSolutionClick, onSeeAll, isLoading = false }: TrailCardListProps) {
  const [enrichedSolutions, setEnrichedSolutions] = useState<TrailSolution[]>([]);
  const [loadingSolutions, setLoadingSolutions] = useState(false);

  // Enriquecer as soluções com dados completos
  useEffect(() => {
    const fetchSolutionDetails = async () => {
      if (!solutions || solutions.length === 0) return;
      
      try {
        setLoadingSolutions(true);
        
        // Extrair apenas os IDs das soluções
        const solutionIds = solutions.map(s => s.solutionId);
        
        // Buscar detalhes completos das soluções
        const { data, error } = await supabase
          .from('solutions')
          .select('*')
          .in('id', solutionIds)
          .eq('published', true);
        
        if (error) {
          console.error("Erro ao buscar detalhes das soluções:", error);
          throw error;
        }
        
        if (!data) {
          throw new Error("Nenhum dado retornado ao buscar soluções");
        }
        
        // Criar um mapa de ID para detalhes da solução
        const solutionsMap = data.reduce((map, solution) => {
          map[solution.id] = solution;
          return map;
        }, {} as Record<string, Solution>);
        
        // Enriquecer as soluções originais com seus detalhes completos
        const enriched = solutions.map(trailSolution => ({
          ...trailSolution,
          solution: solutionsMap[trailSolution.solutionId]
        })).filter(s => s.solution); // Filtrar soluções que não existem mais
        
        setEnrichedSolutions(enriched);
      } catch (error) {
        console.error("Erro ao enriquecer soluções:", error);
      } finally {
        setLoadingSolutions(false);
      }
    };
    
    fetchSolutionDetails();
  }, [solutions]);

  // Estado de carregamento global
  if (isLoading || loadingSolutions) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-10 w-10 animate-spin text-viverblue mb-4" />
        <p className="text-neutral-400">Carregando sua trilha personalizada...</p>
      </div>
    );
  }

  // Verificar se temos soluções
  if (!enrichedSolutions || enrichedSolutions.length === 0) {
    return (
      <div className="text-center py-8 bg-neutral-800/30 rounded-lg border border-neutral-700/50 p-6">
        <p className="text-neutral-300 mb-4">Nenhuma solução encontrada em sua trilha.</p>
        <Button 
          onClick={onSeeAll}
          variant="outline"
          className="bg-transparent border-viverblue text-viverblue hover:bg-viverblue/10"
        >
          Ver todas as soluções disponíveis
        </Button>
      </div>
    );
  }

  // Ordenar soluções por prioridade
  const sortedSolutions = [...enrichedSolutions].sort((a, b) => a.priority - b.priority);

  // Separar por prioridade
  const priority1 = sortedSolutions.filter(s => s.priority === 1);
  const priority2 = sortedSolutions.filter(s => s.priority === 2);
  const priority3 = sortedSolutions.filter(s => s.priority === 3);

  // Renderizar grupo visual para cada prioridade
  const renderPriorityGroup = (title: string, solutions: TrailSolution[], color: string, description: string) => {
    if (solutions.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge className={`${color} text-white font-medium px-3 py-1 rounded-full text-sm`} variant="outline">
            {title}
          </Badge>
          <span className="flex-1 border-t border-[#0ABAB5]/10"></span>
        </div>
        <p className="text-sm text-neutral-400 mb-4">{description}</p>
        <div className="space-y-4">
          {solutions.map(solution => (
            <TrailSolutionCard
              key={solution.solutionId}
              solution={solution}
              onClick={onSolutionClick}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {renderPriorityGroup(
        "Alta Prioridade", 
        priority1, 
        "bg-[#0ABAB5]",
        "Estas soluções foram selecionadas como prioridade máxima com base no seu perfil e objetivos de negócio."
      )}
      {renderPriorityGroup(
        "Prioridade Média", 
        priority2, 
        "bg-amber-500",
        "Depois de implementar as soluções de alta prioridade, estas podem trazer um bom retorno para seu negócio."
      )}
      {renderPriorityGroup(
        "Complementar", 
        priority3, 
        "bg-neutral-500",
        "Soluções adicionais que podem complementar sua estratégia de implementação de IA."
      )}

      <div className="mt-8 text-center">
        <Button
          variant="outline"
          onClick={onSeeAll}
          className="text-[#0ABAB5] border-[#0ABAB5] hover:bg-[#0ABAB5]/10"
        >
          Ver todas as soluções
        </Button>
      </div>
    </div>
  );
}
