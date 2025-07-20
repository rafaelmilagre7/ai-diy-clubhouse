
import { Solution } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCategoryDisplayName } from "@/lib/types/categoryTypes";

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
      navigate(`/implement/${solution.id}/0`);
    } else if (progress) {
      console.log("Chamando continueImplementation");
      continueImplementation();
    } else {
      console.log("Chamando startImplementation");
      startImplementation();
    }
  };
  
  return (
    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl shadow-2xl space-y-6 hidden sm:block group hover:bg-white/10 transition-all duration-500">
      {/* Subtle dots pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none rounded-xl">
        <div className="absolute inset-0 rounded-xl" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
      
      <div className="relative">
        <h3 className="font-medium mb-2 bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
          Status de Implementação
        </h3>
        {progress ? (
          progress.is_completed ? (
            <div className="flex items-center text-green-400">
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
      
      <div className="pt-4 border-t border-white/10 relative">
        {progress?.is_completed ? (
          <div className="space-y-3">
            <Button 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 shadow-lg hover:shadow-green-500/25 transition-all duration-300"
              onClick={() => navigate(`/solution/${solution.id}/certificate`)}
            >
              <Award className="mr-2 h-5 w-5" />
              Ver Certificado
            </Button>
            <Button 
              className="w-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300" 
              onClick={handleImplementation}
              variant="outline"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Revisar Implementação
            </Button>
          </div>
        ) : (
            <Button 
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border-0 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300" 
              onClick={handleImplementation} 
              disabled={initializing}
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              {initializing ? 'Preparando...' : 'Implementar solução'}
            </Button>
        )}
      </div>
      
      <div className="pt-4 border-t border-white/10 relative">
        <h3 className="font-medium mb-2 bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
          Informações
        </h3>
        <div className="space-y-2">
          {solution.category && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Categoria:</span>
              <span className="font-medium text-neutral-200">
                {getCategoryDisplayName(solution.category)}
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
        <div className="pt-4 border-t border-white/10 relative">
          <h3 className="font-medium mb-2 bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {solution.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-200 border border-blue-500/30 hover:bg-blue-500/30 transition-all duration-300"
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
