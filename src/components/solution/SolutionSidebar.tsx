import { Solution } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SolutionCategory } from "@/lib/types/categoryTypes";

interface SolutionSidebarProps {
  solution: Solution;
  progress: any | null;
  startImplementation: () => void;
  continueImplementation: () => void;
  initializing?: boolean;
}

export const SolutionSidebar = ({ 
  solution, 
  progress, 
  startImplementation,
  continueImplementation,
  initializing = false
}: SolutionSidebarProps) => {
  const navigate = useNavigate();
  
  // Handler para o botão de implementação
  const handleImplementation = () => {
    if (progress?.is_completed) {
      navigate(`/implementation/${solution.id}`);
    } else if (progress) {
      console.log("Chamando continueImplementation");
      continueImplementation();
    } else {
      console.log("Chamando startImplementation");
      startImplementation();
    }
  };
  
  // Função auxiliar para converter categoria para texto de exibição
  const getCategoryDisplayText = (category: SolutionCategory): string => {
    switch (category) {
      case 'Receita':
        return "Receita";
      case 'Operacional':
        return "Operacional";
      case 'Estratégia':
        return "Estratégia";
      default:
        return String(category);
    }
  };
  
  return (
    <div className="bg-[#151823] border border-white/5 p-6 rounded-lg shadow-sm space-y-6 hidden sm:block">
      <div>
        <h3 className="font-medium mb-2 text-neutral-100">Status de Implementação</h3>
        {progress ? (
          progress.is_completed ? (
            <div className="flex items-center text-green-500">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Implementação concluída</span>
            </div>
          ) : (
            <div>
              <p className="text-sm text-neutral-400">
                Implementação não concluída
              </p>
            </div>
          )
        ) : (
          <p className="text-sm text-neutral-400">
            Implementação não iniciada
          </p>
        )}
      </div>
      
      <div className="pt-4 border-t border-white/5">
        {progress?.is_completed ? (
          <div className="space-y-3">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => navigate(`/implementation/${solution.id}/completed`)}
            >
              <Award className="mr-2 h-5 w-5" />
              Ver Certificado
            </Button>
            <Button 
              className="w-full" 
              onClick={handleImplementation}
              variant="outline"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Revisar Implementação
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full" 
            onClick={handleImplementation} 
            disabled={initializing}
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            {initializing ? 'Preparando...' : 'Implementar solução'}
          </Button>
        )}
      </div>
      
      <div className="pt-4 border-t border-white/5">
        <h3 className="font-medium mb-2 text-neutral-100">Informações</h3>
        <div className="space-y-2">
          {solution.category && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Categoria:</span>
              <span className="font-medium text-neutral-200">
                {getCategoryDisplayText(solution.category)}
              </span>
            </div>
          )}
          {solution.difficulty && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Dificuldade:</span>
              <span className="font-medium text-neutral-200">
                {solution.difficulty === "easy" && "Fácil"}
                {solution.difficulty === "medium" && "Médio"}
                {solution.difficulty === "advanced" && "Avançado"}
              </span>
            </div>
          )}
          {solution.estimated_time && solution.estimated_time > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Tempo estimado:</span>
              <span className="font-medium text-neutral-200">
                {solution.estimated_time} minutos
              </span>
            </div>
          )}
          {typeof solution.success_rate === "number" && solution.success_rate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Taxa de sucesso:</span>
              <span className="font-medium text-neutral-200">
                {solution.success_rate}%
              </span>
            </div>
          )}
        </div>
      </div>
      
      {solution.tags && solution.tags.length > 0 && (
        <div className="pt-4 border-t border-white/5">
          <h3 className="font-medium mb-2 text-neutral-100">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {solution.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/40 text-blue-200 border border-blue-700/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
