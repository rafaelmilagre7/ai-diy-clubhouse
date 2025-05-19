
import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowRight, Clock, BarChart3 } from 'lucide-react';

interface Solution {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  implementationSteps: string[];
}

interface TrailCurrentSolutionCardProps {
  solution: Solution;
  onSelect: (id: number) => void;
}

export const TrailCurrentSolutionCard: React.FC<TrailCurrentSolutionCardProps> = ({
  solution,
  onSelect
}) => {
  // Mapear dificuldade para cores
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return "bg-emerald-600/20 text-emerald-500 border-emerald-500/30";
      case 'medium': return "bg-amber-600/20 text-amber-500 border-amber-500/30";
      case 'hard': return "bg-red-600/20 text-red-500 border-red-500/30";
      default: return "bg-blue-600/20 text-blue-500 border-blue-500/30";
    }
  };
  
  // Mapeamento de dificuldade para texto em português
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return "Fácil";
      case 'medium': return "Intermediário";
      case 'hard': return "Avançado";
      default: return "Normal";
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1A1E2E] to-[#151823] border border-neutral-700/50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-white">{solution.title}</h3>
          <Badge className={`ml-2 ${getDifficultyColor(solution.difficulty)}`}>
            {getDifficultyText(solution.difficulty)}
          </Badge>
        </div>
        
        <p className="text-neutral-400">{solution.description}</p>
        
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <Clock className="h-4 w-4" />
          <span>Tempo estimado: {solution.estimatedTime}</span>
        </div>
        
        <div className="border-t border-neutral-700/30 pt-4 mt-4">
          <h4 className="text-sm font-medium text-neutral-300 flex items-center mb-2">
            <BarChart3 className="h-4 w-4 mr-2 text-[#0ABAB5]" />
            Etapas de Implementação
          </h4>
          <ul className="space-y-1">
            {solution.implementationSteps.map((step, index) => (
              <li key={index} className="text-sm text-neutral-300 flex items-center">
                <div className="w-5 h-5 rounded-full bg-[#0ABAB5]/20 text-[#0ABAB5] flex items-center justify-center mr-2 text-xs">
                  {index + 1}
                </div>
                {step}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="pt-4">
          <Button
            onClick={() => onSelect(solution.id)}
            className="w-full bg-gradient-to-r from-[#0ABAB5] to-[#34D399] hover:from-[#0ABAB5]/90 hover:to-[#34D399]/90 text-black font-medium"
          >
            Ver Detalhes da Solução
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
