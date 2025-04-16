
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
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso atual</span>
                <span className="font-medium">{Math.round((progress.current_module / 6) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{width: `${Math.round((progress.current_module / 6) * 100)}%`}}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Você está no módulo {progress.current_module + 1} de 6
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
        <h3 className="font-medium mb-3">Ações</h3>
        {progress?.is_completed ? (
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => navigate(`/implement/${solution.id}/5`)}
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Ver Certificado
          </Button>
        ) : progress ? (
          <Button 
            className="w-full" 
            onClick={continueImplementation} 
            disabled={initializing}
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            {initializing ? 'Preparando...' : 'Continuar Implementação'}
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={startImplementation} 
            disabled={initializing}
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            {initializing ? 'Preparando...' : 'Iniciar Implementação'}
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
