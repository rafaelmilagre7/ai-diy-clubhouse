
import { useParams, useNavigate } from "react-router-dom";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useSolutionData } from "@/hooks/useSolutionData";
import { SolutionTabsContent } from "@/components/solution/tabs/SolutionTabsContent";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { useEffect } from "react";
import { useLogging } from "@/hooks/useLogging";
import { PageTransition } from "@/components/transitions/PageTransition";
import { FadeTransition } from "@/components/transitions/FadeTransition";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SolutionImplementation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { log, logError } = useLogging();
  
  // Fetch solution data
  const { solution, loading, error, progress } = useSolutionData(id);
  
  // Log page visit
  useEffect(() => {
    if (solution) {
      log("Solution implementation page visited", { 
        solution_id: solution.id, 
        solution_title: solution.title,
        has_progress: !!progress
      });
    }
  }, [solution, log, progress]);
  
  if (loading) {
    return <LoadingScreen message="Carregando implementação da solução..." />;
  }
  
  if (!solution) {
    logError("Solution not found", { id });
    return <SolutionNotFound />;
  }

  const handleBackToSolution = () => {
    navigate(`/solution/${id}`);
  };

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
  
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto pb-12">
        {/* Header com botão voltar */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4" 
            onClick={handleBackToSolution}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Solução
          </Button>

          <Card className="bg-[#151823] border border-white/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    {solution.title}
                  </CardTitle>
                  <p className="text-neutral-400">
                    Implementação da Solução
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`border-0 ${getDifficultyColor(solution.difficulty)}`}
                  >
                    {getDifficultyLabel(solution.difficulty)}
                  </Badge>
                  <Badge variant="outline" className="bg-neutral-800 text-neutral-200 border-neutral-700">
                    {solution.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
        
        {/* Conteúdo com abas */}
        <FadeTransition>
          <SolutionTabsContent solution={solution} />
        </FadeTransition>
      </div>
    </PageTransition>
  );
};

export default SolutionImplementation;
