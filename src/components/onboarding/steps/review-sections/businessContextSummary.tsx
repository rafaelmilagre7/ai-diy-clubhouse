
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";

export function getBusinessContextSummary(data: OnboardingData['business_context']) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      <p><span className="font-medium">Modelo de negócio:</span> {data.business_model || "Não preenchido"}</p>
      
      {data.business_challenges && data.business_challenges.length > 0 && (
        <div>
          <span className="font-medium">Desafios do negócio:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.business_challenges.map((challenge: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{challenge}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {data.important_kpis && data.important_kpis.length > 0 && (
        <div>
          <span className="font-medium">KPIs importantes:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.important_kpis.map((kpi: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{kpi}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {data.additional_context && (
        <p><span className="font-medium">Contexto adicional:</span> {data.additional_context}</p>
      )}
    </div>
  );
}
