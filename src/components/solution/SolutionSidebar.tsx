
import { Solution } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6 hidden sm:block">
      <div>
        <h3 className="font-medium mb-2">Status de Implementação</h3>
        {progress ? (
          progress.is_completed ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Implementação concluída</span>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">
                Implementação não concluída
              </p>
            </div>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            Implementação não iniciada
          </p>
        )}
      </div>
      
      <div className="pt-4 border-t">
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
      
      <div className="pt-4 border-t">
        <h3 className="font-medium mb-2">Informações</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Categoria:</span>
            <span className="font-medium">
              {solution.category === "revenue" && "Receita"}
              {solution.category === "operational" && "Operacional"}
              {solution.category === "strategy" && "Estratégia"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dificuldade:</span>
            <span className="font-medium">
              {solution.difficulty === "easy" && "Fácil"}
              {solution.difficulty === "medium" && "Médio"}
              {solution.difficulty === "advanced" && "Avançado"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tempo estimado:</span>
            <span className="font-medium">
              {solution.estimated_time ? `${solution.estimated_time} minutos` : "45 minutos"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa de sucesso:</span>
            <span className="font-medium">
              {solution.success_rate ? `${solution.success_rate}%` : "92%"}
            </span>
          </div>
        </div>
      </div>
      
      {solution.tags && solution.tags.length > 0 && (
        <div className="pt-4 border-t">
          <h3 className="font-medium mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {solution.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
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
