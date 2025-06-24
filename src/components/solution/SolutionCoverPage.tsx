
import React from "react";
import { Solution, Progress } from "@/hooks/useSolutionData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Target, CheckCircle2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SolutionCoverPageProps {
  solution: Solution;
  progress?: Progress | null;
}

export const SolutionCoverPage = ({ solution, progress }: SolutionCoverPageProps) => {
  const navigate = useNavigate();

  const progressPercent = progress?.is_completed 
    ? 100 
    : Math.round(((progress?.current_module || 0) / 10) * 100);

  const handleStartImplementation = () => {
    navigate(`/implement/${solution.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-viverblue/10 text-viverblue border-viverblue/30">
          <Target className="h-3 w-3 mr-1" />
          Solução
        </Badge>
        <Badge variant="outline" className="bg-neutral-800 text-neutral-300 border-neutral-700">
          {solution.category}
        </Badge>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold font-heading text-neutral-100 mb-4">
        {solution.title}
      </h1>

      <p className="text-neutral-400 text-lg mb-8">
        {solution.description}
      </p>

      {/* Progress Card */}
      {progress && (
        <Card className="bg-[#151823] border border-white/5 mb-6">
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
              <ProgressBar 
                value={progressPercent} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <Button
        onClick={handleStartImplementation}
        className="bg-viverblue hover:bg-viverblue/90 text-white px-8 py-3 text-lg"
        size="lg"
      >
        <Play className="h-5 w-5 mr-2" />
        {progress?.is_completed ? 'Revisar Implementação' : progress ? 'Continuar Implementação' : 'Iniciar Implementação'}
      </Button>
    </div>
  );
};
