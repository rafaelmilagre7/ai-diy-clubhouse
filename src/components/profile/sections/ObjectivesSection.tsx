
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Clock, DollarSign } from "lucide-react";
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface ObjectivesSectionProps {
  data: OnboardingData;
}

export const ObjectivesSection = ({ data }: ObjectivesSectionProps) => {
  const getObjectiveInfo = (objective: string) => {
    const objectiveMap: Record<string, { label: string; icon: JSX.Element; color: string }> = {
      'reduce-costs': { 
        label: 'Reduzir Custos', 
        icon: <DollarSign className="h-4 w-4" />, 
        color: 'bg-red-500/20 text-red-400' 
      },
      'increase-sales': { 
        label: 'Aumentar Vendas', 
        icon: <TrendingUp className="h-4 w-4" />, 
        color: 'bg-green-500/20 text-green-400' 
      },
      'automate-processes': { 
        label: 'Automatizar Processos', 
        icon: <Zap className="h-4 w-4" />, 
        color: 'bg-blue-500/20 text-blue-400' 
      },
      'innovate-products': { 
        label: 'Inovar Produtos', 
        icon: <Target className="h-4 w-4" />, 
        color: 'bg-purple-500/20 text-purple-400' 
      },
    };
    return objectiveMap[objective] || { 
      label: objective, 
      icon: <Target className="h-4 w-4" />, 
      color: 'bg-gray-500/20 text-gray-400' 
    };
  };

  const objectiveInfo = data.mainObjective ? getObjectiveInfo(data.mainObjective) : null;

  return (
    <Card className="glass-dark">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-high-contrast">
          <Target className="h-5 w-5 text-viverblue" />
          Objetivos e Metas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {objectiveInfo && (
          <div>
            <label className="text-sm text-medium-contrast">Objetivo Principal</label>
            <Badge className={`${objectiveInfo.color} mt-1`}>
              {objectiveInfo.icon}
              <span className="ml-1">{objectiveInfo.label}</span>
            </Badge>
          </div>
        )}

        {data.areaToImpact && (
          <div>
            <label className="text-sm text-medium-contrast">Área para Impactar</label>
            <p className="text-high-contrast bg-neutral-800/50 p-3 rounded-lg mt-1">
              {data.areaToImpact}
            </p>
          </div>
        )}

        {data.expectedResult90Days && (
          <div>
            <label className="text-sm text-medium-contrast flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Resultado Esperado (90 dias)
            </label>
            <p className="text-high-contrast bg-viverblue/10 border border-viverblue/20 p-3 rounded-lg mt-1">
              {data.expectedResult90Days}
            </p>
          </div>
        )}

        {data.aiImplementationBudget && (
          <div>
            <label className="text-sm text-medium-contrast flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Orçamento para IA
            </label>
            <Badge variant="outline" className="mt-1">
              {data.aiImplementationBudget}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
