
import React from 'react';
import { Link } from 'react-router-dom';
import { Solution } from '@/lib/supabase/types';
import { Progress } from '@/lib/supabase/types';
import { Button } from "@/components/ui/button";
import { Rocket, CheckCircle, Lock, Sparkles } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { safeSolutionCategory } from '@/lib/supabase/types';

interface SolutionSidebarProps {
  solution: Solution;
  progress: Progress | null;
  startImplementation: () => Promise<boolean>;
  continueImplementation: () => void;
  initializing: boolean;
}

const SolutionSidebar = ({ solution, progress, startImplementation, continueImplementation, initializing }: SolutionSidebarProps) => {
  const isCompleted = progress?.is_completed === true;
  const hasStarted = !!progress;

  const getCategoryColor = (category: string) => {
    const categoryColors = {
      'Receita': 'bg-revenue/10 text-revenue border-revenue/20',
      'Operacional': 'bg-operational/10 text-operational border-operational/20',
      'Estratégia': 'bg-strategy/10 text-strategy border-strategy/20'
    };
    
    return categoryColors[category as keyof typeof categoryColors] || 'bg-neutral-100 text-neutral-700';
  };

  return (
    <div className="sticky top-4 space-y-6">
      <div className="rounded-md border border-neutral-700 bg-neutral-900 p-4 space-y-4">
        <h3 className="text-lg font-semibold">Detalhes</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">Categoria:</span>
            {solution ? (
              <Badge variant="outline" className={getCategoryColor(solution.category)}>
                {solution.category}
              </Badge>
            ) : (
              <Skeleton className="h-5 w-20" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">Dificuldade:</span>
            {solution ? (
              <Badge variant="secondary">
                {solution.difficulty_level || solution.difficulty || 'Médio'}
              </Badge>
            ) : (
              <Skeleton className="h-5 w-20" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">Tempo Estimado:</span>
            {solution ? (
              <span className="text-sm text-neutral-200">
                {solution.estimated_time_hours || 'Não especificado'} horas
              </span>
            ) : (
              <Skeleton className="h-5 w-20" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">ROI Potencial:</span>
            {solution ? (
              <span className="text-sm text-neutral-200">
                {solution.roi_potential || 'Não especificado'}
              </span>
            ) : (
              <Skeleton className="h-5 w-20" />
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-neutral-700 bg-neutral-900 p-4 space-y-4">
        <h3 className="text-lg font-semibold">Ações</h3>
        <div className="space-y-2">
          {isCompleted ? (
            <div className="text-green-500 font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Implementação Concluída!
            </div>
          ) : (
            <>
              {hasStarted ? (
                <Button
                  className="w-full bg-viverblue hover:bg-viverblue/90"
                  onClick={continueImplementation}
                  disabled={initializing}
                >
                  Continuar Implementação
                </Button>
              ) : (
                <Button
                  className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
                  onClick={startImplementation}
                  disabled={initializing}
                >
                  {initializing ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-4 w-4" />
                      Iniciar Implementação
                    </>
                  )}
                </Button>
              )}
            </>
          )}
          <Link to="/member/dashboard" className="text-sm text-neutral-400 hover:text-neutral-200 block text-center">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>

      <div className="rounded-md border border-neutral-700 bg-neutral-900 p-4 space-y-4">
        <h3 className="text-lg font-semibold">Recursos</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-neutral-500" />
            <a href="#" className="text-sm text-neutral-400 hover:text-neutral-200">
              Guia de Implementação (Em breve)
            </a>
          </li>
          <li className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-neutral-500" />
            <a href="#" className="text-sm text-neutral-400 hover:text-neutral-200">
              Templates e Documentos (Em breve)
            </a>
          </li>
          <li className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-neutral-500" />
            <a href="#" className="text-sm text-neutral-400 hover:text-neutral-200">
              Checklist de Implementação (Em breve)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SolutionSidebar;
