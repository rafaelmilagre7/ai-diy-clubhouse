
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";
import { ImplementationTrail } from "@/types/implementation-trail";
import { TrailSolutionsList } from "./TrailSolutionsList";
import { TrailLessonsList } from "./TrailLessonsList";
import { useTrailEnrichment } from "@/hooks/implementation/useTrailEnrichment";
import { useTrailSolutionsEnrichment } from "@/hooks/implementation/useTrailSolutionsEnrichment";

interface TrailDisplayContentProps {
  trail: ImplementationTrail;
  onRegenerate: () => void;
}

export const TrailDisplayContent: React.FC<TrailDisplayContentProps> = ({
  trail,
  onRegenerate
}) => {
  const { enrichedLessons, isLoading: lessonsLoading } = useTrailEnrichment(trail);
  const { enrichedSolutions, isLoading: solutionsLoading } = useTrailSolutionsEnrichment(trail);

  return (
    <div className="space-y-8">
      {/* Header da Trilha */}
      <Card className="bg-gradient-to-br from-viverblue/10 via-transparent to-viverblue/5 border-viverblue/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-viverblue flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6" />
            Sua Trilha Personalizada VIVER DE IA
          </CardTitle>
          <p className="text-neutral-400">
            Soluções e aulas selecionadas especialmente para o seu perfil e objetivos
          </p>
        </CardHeader>
      </Card>

      {/* Soluções Recomendadas */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-viverblue" />
            Soluções para Implementar
          </h2>
          <Button
            onClick={onRegenerate}
            variant="outline"
            size="sm"
            className="border-viverblue/40 text-viverblue hover:bg-viverblue/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerar Trilha
          </Button>
        </div>
        
        {solutionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
            <span className="ml-3 text-neutral-400">Carregando soluções...</span>
          </div>
        ) : (
          <TrailSolutionsList solutions={enrichedSolutions} />
        )}
      </div>

      {/* Aulas Recomendadas */}
      {enrichedLessons && enrichedLessons.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-viverblue" />
              Aulas Recomendadas
            </h2>
          </div>
          
          {lessonsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
              <span className="ml-3 text-neutral-400">Carregando aulas...</span>
            </div>
          ) : (
            <TrailLessonsList lessons={enrichedLessons} />
          )}
        </div>
      )}

      {/* Footer com informações */}
      <Card className="bg-neutral-800/20 border-neutral-700/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-neutral-400">
              💡 Esta trilha foi gerada com base no seu perfil e objetivos definidos na configuração inicial
            </p>
            <p className="text-xs text-neutral-500">
              Você pode regenerar sua trilha a qualquer momento para obter novas recomendações
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
