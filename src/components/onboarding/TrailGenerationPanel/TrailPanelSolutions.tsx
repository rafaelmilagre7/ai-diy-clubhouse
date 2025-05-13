
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrailCurrentSolutionCard } from '../TrailCurrentSolutionCard';
import { Sparkles, Gauge, Zap } from 'lucide-react';

interface TrailPanelSolutionsProps {
  solutions: any[];
}

export const TrailPanelSolutions: React.FC<TrailPanelSolutionsProps> = ({ solutions }) => {
  const navigate = useNavigate();
  
  // Agrupar soluções por prioridade
  const priority1 = solutions.filter(s => s.priority === 1);
  const priority2 = solutions.filter(s => s.priority === 2);
  const priority3 = solutions.filter(s => s.priority === 3);
  
  const handleNavigateToSolution = (id: string) => {
    navigate(`/solution/${id}`);
  };
  
  // Função para renderizar o header de cada grupo de prioridades
  const renderPriorityHeader = (priority: number, title: string, description: string) => {
    const getPriorityIcon = () => {
      switch (priority) {
        case 1: return <Sparkles className="h-5 w-5 text-[#0ABAB5]" />;
        case 2: return <Gauge className="h-5 w-5 text-amber-400" />;
        case 3: return <Zap className="h-5 w-5 text-neutral-400" />;
        default: return null;
      }
    };
    
    const getPriorityColor = () => {
      switch (priority) {
        case 1: return "from-[#0ABAB5]/10 to-transparent border-[#0ABAB5]/20";
        case 2: return "from-amber-500/10 to-transparent border-amber-500/20";
        case 3: return "from-neutral-500/10 to-transparent border-neutral-500/20";
        default: return "from-gray-500/10 to-transparent border-gray-500/20";
      }
    };
    
    return (
      <div className={`flex items-center gap-3 p-3 bg-gradient-to-r ${getPriorityColor()} rounded-md border mb-4`}>
        <div className="p-1.5 rounded-full bg-[#151823]/50">
          {getPriorityIcon()}
        </div>
        <div>
          <h3 className="font-medium text-white">{title}</h3>
          <p className="text-sm text-neutral-400">{description}</p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-8">
      {priority1.length > 0 && (
        <div>
          {renderPriorityHeader(
            1, 
            "Soluções de Alta Prioridade", 
            "Recomendamos começar implementando estas soluções para obter resultados mais rápidos"
          )}
          <div className="space-y-2">
            {priority1.map(solution => (
              <TrailCurrentSolutionCard
                key={solution.solutionId}
                solution={solution}
                onSelect={handleNavigateToSolution}
              />
            ))}
          </div>
        </div>
      )}
      
      {priority2.length > 0 && (
        <div>
          {renderPriorityHeader(
            2, 
            "Soluções de Média Prioridade", 
            "Boas oportunidades para expandir os benefícios de IA em seu negócio"
          )}
          <div className="space-y-2">
            {priority2.map(solution => (
              <TrailCurrentSolutionCard
                key={solution.solutionId}
                solution={solution}
                onSelect={handleNavigateToSolution}
              />
            ))}
          </div>
        </div>
      )}
      
      {priority3.length > 0 && (
        <div>
          {renderPriorityHeader(
            3, 
            "Soluções Complementares", 
            "Implementações que podem agregar mais valor ao seu negócio com IA"
          )}
          <div className="space-y-2">
            {priority3.map(solution => (
              <TrailCurrentSolutionCard
                key={solution.solutionId}
                solution={solution}
                onSelect={handleNavigateToSolution}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
