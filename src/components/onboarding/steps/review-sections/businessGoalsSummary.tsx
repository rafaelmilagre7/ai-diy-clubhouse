
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";

export function getBusinessGoalsSummary(data: OnboardingData['business_goals']) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      <p><span className="font-medium">Objetivo principal:</span> {data.primary_goal || "Não preenchido"}</p>
      
      {data.expected_outcomes && data.expected_outcomes.length > 0 && (
        <div>
          <span className="font-medium">Resultados esperados:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.expected_outcomes.map((outcome: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{outcome}</Badge>
            ))}
          </div>
        </div>
      )}
      
      <p><span className="font-medium">Resultado esperado em 30 dias:</span> {data.expected_outcome_30days || "Não preenchido"}</p>
      <p><span className="font-medium">Linha de tempo:</span> {data.timeline || "Não preenchido"}</p>
      <p><span className="font-medium">Tipo de solução prioritária:</span> {data.priority_solution_type || "Não preenchido"}</p>
    </div>
  );
}
