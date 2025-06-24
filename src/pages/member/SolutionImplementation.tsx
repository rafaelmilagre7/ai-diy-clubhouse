
import { useParams, useLocation } from "react-router-dom";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useSolutionData } from "@/hooks/useSolutionData";
import { SolutionBackButton } from "@/components/solution/SolutionBackButton";
import { SolutionTabsContent } from "@/components/solution/tabs/SolutionTabsContent";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { useEffect } from "react";
import { useLogging } from "@/hooks/useLogging";
import { PageTransition } from "@/components/transitions/PageTransition";
import { FadeTransition } from "@/components/transitions/FadeTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle2 } from "lucide-react";

const SolutionImplementation = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { log, logError } = useLogging();
  
  // Fetch solution data with the updated hook that includes progress
  const { solution, loading, error, progress } = useSolutionData(id);
  
  // Log page visit
  useEffect(() => {
    if (solution) {
      log("Solution implementation page visited", { 
        solution_id: solution.id, 
        solution_title: solution.title,
        path: location.pathname
      });
    }
  }, [solution, location.pathname, log]);
  
  if (loading) {
    return <LoadingScreen message="Carregando implementação da solução..." />;
  }
  
  if (!solution) {
    logError("Solution not found", { id });
    return <SolutionNotFound />;
  }

  const progressPercent = progress?.is_completed 
    ? 100 
    : Math.round(((progress?.current_module || 0) / 10) * 100);
  
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto pb-12">
        <SolutionBackButton />
        
        {/* Implementation Header */}
        <FadeTransition>
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="outline" className="bg-viverblue/10 text-viverblue border-viverblue/30">
                <Target className="h-3 w-3 mr-1" />
                Implementação
              </Badge>
              <Badge variant="outline" className="bg-neutral-800 text-neutral-300 border-neutral-700">
                {solution.category}
              </Badge>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold font-heading text-neutral-100 mb-4">
              {solution.title}
            </h1>

            {/* Progress Card */}
            {progress && (
              <Card className="bg-[#151823] border border-white/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-neutral-100 flex items-center gap-2">
                    {progress.is_completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Target className="h-5 w-5 text-viverblue" />
                    )}
                    {progress.is_completed ? "Implementação Concluída" : "Progresso da Implementação"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Progresso</span>
                      <span className="text-neutral-300 font-medium">{progressPercent}%</span>
                    </div>
                    <Progress 
                      value={progressPercent} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </FadeTransition>
        
        {/* Implementation Tabs */}
        <FadeTransition delay={0.2}>
          <SolutionTabsContent solution={solution} />
        </FadeTransition>
      </div>
    </PageTransition>
  );
};

export default SolutionImplementation;
