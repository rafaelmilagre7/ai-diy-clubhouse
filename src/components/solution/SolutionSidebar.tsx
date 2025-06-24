
import { Solution } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle, Award, FileText, Wrench, Video, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SolutionCategory } from "@/lib/types/categoryTypes";
import { useEffect } from "react";
import { useSolutionStats } from "@/hooks/useSolutionStats";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { stats, loading: statsLoading } = useSolutionStats(solution.id);
  
  // Log de depuração para identificar o problema
  useEffect(() => {
    console.log("[SOLUTION_SIDEBAR] Estado do progresso:", {
      solutionId: solution.id,
      progress: progress,
      isCompleted: progress?.is_completed,
      hasProgress: !!progress,
      progressKeys: progress ? Object.keys(progress) : []
    });
  }, [progress, solution.id]);
  
  // Handler para o botão de implementação
  const handleImplementation = () => {
    console.log("[SOLUTION_SIDEBAR] Ação de implementação:", {
      hasProgress: !!progress,
      isCompleted: progress?.is_completed
    });
    
    if (progress?.is_completed) {
      navigate(`/implement/${solution.id}/0`);
    } else if (progress) {
      console.log("[SOLUTION_SIDEBAR] Chamando continueImplementation");
      continueImplementation();
    } else {
      console.log("[SOLUTION_SIDEBAR] Chamando startImplementation");
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
                Implementação em andamento
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
              onClick={() => navigate(`/solution/${solution.id}/certificate`)}
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
            {initializing ? 'Preparando...' : 
             progress ? 'Continuar Implementação' : 'Implementar solução'}
          </Button>
        )}
      </div>

      {/* Seção de Estatísticas Detalhadas */}
      <div className="pt-4 border-t border-white/5">
        <h3 className="font-medium mb-3 text-neutral-100">Conteúdo da Solução</h3>
        {statsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {stats.modulesCount > 0 && (
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-viverblue" />
                  <span className="text-neutral-400">Módulos:</span>
                </div>
                <span className="font-medium text-neutral-200">{stats.modulesCount}</span>
              </div>
            )}
            {stats.resourcesCount > 0 && (
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-viverblue" />
                  <span className="text-neutral-400">Recursos:</span>
                </div>
                <span className="font-medium text-neutral-200">{stats.resourcesCount}</span>
              </div>
            )}
            {stats.toolsCount > 0 && (
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-viverblue" />
                  <span className="text-neutral-400">Ferramentas:</span>
                </div>
                <span className="font-medium text-neutral-200">{stats.toolsCount}</span>
              </div>
            )}
            {stats.videosCount > 0 && (
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-viverblue" />
                  <span className="text-neutral-400">Vídeos:</span>
                </div>
                <span className="font-medium text-neutral-200">{stats.videosCount}</span>
              </div>
            )}
            {stats.estimatedTimeMinutes > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Tempo estimado:</span>
                <span className="font-medium text-neutral-200">
                  {stats.estimatedTimeMinutes} min
                </span>
              </div>
            )}
          </div>
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
          {/* estimated_time removido da interface Solution, só mostrar com fallback se existir */}
          {"estimated_time" in solution && typeof (solution as any).estimated_time === "number" && (solution as any).estimated_time > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Tempo estimado:</span>
              <span className="font-medium text-neutral-200">
                {(solution as any).estimated_time} minutos
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
