
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, Lightbulb, CheckCircle2 } from "lucide-react";
import { useSolutionStats } from "@/hooks/useSolutionStats";
import { Skeleton } from "@/components/ui/skeleton";

interface OverviewTabProps {
  solution: Solution;
}

export const OverviewTab = ({ solution }: OverviewTabProps) => {
  const { stats, loading: statsLoading } = useSolutionStats(solution.id);

  return (
    <div className="space-y-6">
      {/* Descrição da Solução */}
      <Card className="bg-[#151823] border border-white/5">
        <CardHeader>
          <CardTitle className="text-neutral-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-viverblue" />
            Sobre esta Solução
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-300 leading-relaxed">
            {solution.description}
          </p>
        </CardContent>
      </Card>

      {/* Resumo Estatístico */}
      <Card className="bg-[#151823] border border-white/5">
        <CardHeader>
          <CardTitle className="text-neutral-100 flex items-center gap-2">
            <Target className="h-5 w-5 text-viverblue" />
            Resumo do Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center p-4 bg-neutral-800/50 rounded-lg">
                  <Skeleton className="h-8 w-8 mx-auto mb-2" />
                  <Skeleton className="h-4 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.modulesCount > 0 && (
                <div className="text-center p-4 bg-viverblue/10 rounded-lg border border-viverblue/20">
                  <div className="text-2xl font-bold text-viverblue mb-1">
                    {stats.modulesCount}
                  </div>
                  <div className="text-sm text-neutral-300">
                    {stats.modulesCount === 1 ? 'Módulo' : 'Módulos'}
                  </div>
                </div>
              )}
              
              {stats.resourcesCount > 0 && (
                <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">
                    {stats.resourcesCount}
                  </div>
                  <div className="text-sm text-neutral-300">
                    {stats.resourcesCount === 1 ? 'Recurso' : 'Recursos'}
                  </div>
                </div>
              )}
              
              {stats.toolsCount > 0 && (
                <div className="text-center p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <div className="text-2xl font-bold text-amber-400 mb-1">
                    {stats.toolsCount}
                  </div>
                  <div className="text-sm text-neutral-300">
                    {stats.toolsCount === 1 ? 'Ferramenta' : 'Ferramentas'}
                  </div>
                </div>
              )}
              
              {stats.videosCount > 0 && (
                <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {stats.videosCount}
                  </div>
                  <div className="text-sm text-neutral-300">
                    {stats.videosCount === 1 ? 'Vídeo' : 'Vídeos'}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {stats.estimatedTimeMinutes > 0 && (
            <div className="mt-6 p-4 bg-neutral-800/30 rounded-lg border border-neutral-700">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-viverblue" />
                <span className="text-neutral-300">
                  Tempo estimado total: <strong className="text-viverblue">{stats.estimatedTimeMinutes} minutos</strong>
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* O que você vai aprender */}
      <Card className="bg-[#151823] border border-white/5">
        <CardHeader>
          <CardTitle className="text-neutral-100 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-viverblue" />
            O que você vai conseguir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <p className="text-neutral-300 mb-4">
              Ao implementar esta solução, você será capaz de:
            </p>
            <ul className="list-none space-y-2">
              <li className="flex items-start gap-2 text-neutral-300">
                <CheckCircle2 className="h-5 w-5 text-viverblue mt-0.5 flex-shrink-0" />
                Aplicar conceitos práticos diretamente no seu contexto
              </li>
              <li className="flex items-start gap-2 text-neutral-300">
                <CheckCircle2 className="h-5 w-5 text-viverblue mt-0.5 flex-shrink-0" />
                Utilizar ferramentas profissionais de forma eficiente
              </li>
              <li className="flex items-start gap-2 text-neutral-300">
                <CheckCircle2 className="h-5 w-5 text-viverblue mt-0.5 flex-shrink-0" />
                Obter resultados mensuráveis e impacto real
              </li>
              <li className="flex items-start gap-2 text-neutral-300">
                <CheckCircle2 className="h-5 w-5 text-viverblue mt-0.5 flex-shrink-0" />
                Desenvolver competências valiosas para sua carreira
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
