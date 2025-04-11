
import { Button } from "@/components/ui/button";
import { Solution } from "@/lib/supabase";
import { Award, Play, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SolutionSidebarProps {
  solution: Solution;
  progress: any | null;
  startImplementation: () => Promise<void>;
  continueImplementation: () => void;
}

export const SolutionSidebar = ({ 
  solution, 
  progress, 
  startImplementation, 
  continueImplementation 
}: SolutionSidebarProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">Badge ao concluir:</span>
            <span className="font-medium">Especialista em {solution.title}</span>
          </div>
          
          <div className="pt-2">
            {progress ? (
              progress.is_completed ? (
                <div className="space-y-3">
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate(`/implement/${solution.id}/7`)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Implementação Concluída
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/implement/${solution.id}/0`)}>
                    Iniciar Novamente
                  </Button>
                </div>
              ) : (
                <Button className="w-full" onClick={continueImplementation}>
                  <Play className="mr-2 h-4 w-4" />
                  Continuar Implementação
                </Button>
              )
            ) : (
              <Button className="w-full" onClick={startImplementation}>
                <Play className="mr-2 h-4 w-4" />
                Iniciar Implementação
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="font-semibold">Implementada por</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Mais de 125 membros já implementaram esta solução em suas empresas.
        </p>
        
        <div className="flex -space-x-2 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
              {i}
            </div>
          ))}
          <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium">
            +120
          </div>
        </div>
      </div>
    </div>
  );
};
