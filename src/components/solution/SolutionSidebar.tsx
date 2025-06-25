
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Clock, 
  Target, 
  TrendingUp, 
  Settings, 
  BarChart,
  FileText,
  Wrench,
  Video,
  ArrowRight
} from "lucide-react";
import { useSolutionStats } from "@/hooks/useSolutionStats";
import { useNavigate } from "react-router-dom";

interface SolutionSidebarProps {
  solution: Solution;
  progress?: any;
  startImplementation?: () => Promise<any>;
  continueImplementation?: () => void;
  initializing?: boolean;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "text-emerald-400 bg-emerald-400/10";
    case "medium":
      return "text-amber-400 bg-amber-400/10";
    case "advanced":
      return "text-rose-400 bg-rose-400/10";
    default:
      return "text-gray-400 bg-gray-400/10";
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "Fácil";
    case "medium":
      return "Médio";
    case "advanced":
      return "Avançado";
    default:
      return difficulty;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Receita':
      return <TrendingUp className="h-4 w-4" />;
    case 'Operacional':
      return <Settings className="h-4 w-4" />;
    case 'Estratégia':
      return <BarChart className="h-4 w-4" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

export const SolutionSidebar = ({ 
  solution, 
  progress, 
  startImplementation, 
  continueImplementation, 
  initializing 
}: SolutionSidebarProps) => {
  const { stats, loading: statsLoading } = useSolutionStats(solution.id);
  const navigate = useNavigate();

  const handleImplementationClick = async () => {
    if (progress?.is_completed || progress?.current_module > 0) {
      // Se já há progresso, vai direto para a implementação
      navigate(`/implementation/${solution.id}`);
    } else if (startImplementation) {
      // Se não há progresso, inicia a implementação
      await startImplementation();
      navigate(`/implementation/${solution.id}`);
    } else {
      // Fallback - vai direto para implementação
      navigate(`/implementation/${solution.id}`);
    }
  };

  const getButtonText = () => {
    if (initializing) return "Iniciando...";
    if (progress?.is_completed) return "Revisar Implementação";
    if (progress?.current_module > 0) return "Continuar Implementação";
    return "Implementar Solução";
  };

  const getButtonIcon = () => {
    if (progress?.is_completed || progress?.current_module > 0) {
      return <ArrowRight className="h-5 w-5 mr-2" />;
    }
    return <Play className="h-5 w-5 mr-2" />;
  };

  return (
    <div className="space-y-6">
      {/* Botão de Implementar */}
      <Card className="bg-gradient-to-br from-viverblue/20 to-viverblue/5 border border-viverblue/30">
        <CardContent className="p-6">
          <Button
            onClick={handleImplementationClick}
            disabled={initializing}
            className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-medium py-3"
            size="lg"
          >
            {getButtonIcon()}
            {getButtonText()}
          </Button>
          <p className="text-xs text-neutral-400 mt-3 text-center">
            {progress?.is_completed 
              ? "Revise sua implementação completa"
              : progress?.current_module > 0
              ? "Continue de onde parou"
              : "Comece agora a aplicar esta solução"
            }
          </p>
        </CardContent>
      </Card>

      {/* Informações da Solução */}
      <Card className="bg-[#151823] border border-white/5">
        <CardHeader>
          <CardTitle className="text-neutral-100 text-lg">
            Detalhes da Solução
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Categoria */}
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-sm">Categoria</span>
            <Badge variant="outline" className="bg-neutral-800 text-neutral-200 border-neutral-700 flex items-center gap-1">
              {getCategoryIcon(solution.category)}
              {solution.category}
            </Badge>
          </div>

          {/* Dificuldade */}
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-sm">Dificuldade</span>
            <Badge 
              variant="outline" 
              className={`border-0 ${getDifficultyColor(solution.difficulty)}`}
            >
              {getDifficultyLabel(solution.difficulty)}
            </Badge>
          </div>

          {/* Estatísticas de Conteúdo */}
          {!statsLoading && (
            <>
              {stats.resourcesCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Recursos
                  </span>
                  <span className="text-emerald-400 font-medium">
                    {stats.resourcesCount}
                  </span>
                </div>
              )}

              {stats.toolsCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-sm flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Ferramentas
                  </span>
                  <span className="text-amber-400 font-medium">
                    {stats.toolsCount}
                  </span>
                </div>
              )}

              {stats.videosCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-sm flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Vídeos
                  </span>
                  <span className="text-purple-400 font-medium">
                    {stats.videosCount}
                  </span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
