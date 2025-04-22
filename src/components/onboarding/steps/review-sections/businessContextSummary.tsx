
import React from "react";

export function getBusinessContextSummary(data: any) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      <p><span className="font-medium">Modelo de negócio:</span> {data.business_model || "Não preenchido"}</p>
      
      {data.business_challenges && data.business_challenges.length > 0 && (
        <div>
          <p className="font-medium">Desafios de negócio:</p>
          <ul className="list-disc pl-5">
            {data.business_challenges.map((challenge: string, index: number) => (
              <li key={index}>{challenge}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.short_term_goals && data.short_term_goals.length > 0 && (
        <div>
          <p className="font-medium">Objetivos de curto prazo:</p>
          <ul className="list-disc pl-5">
            {data.short_term_goals.map((goal: string, index: number) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.medium_term_goals && data.medium_term_goals.length > 0 && (
        <div>
          <p className="font-medium">Objetivos de médio prazo:</p>
          <ul className="list-disc pl-5">
            {data.medium_term_goals.map((goal: string, index: number) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.important_kpis && data.important_kpis.length > 0 && (
        <div>
          <p className="font-medium">KPIs importantes:</p>
          <ul className="list-disc pl-5">
            {data.important_kpis.map((kpi: string, index: number) => (
              <li key={index}>{kpi}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.additional_context && (
        <div>
          <p className="font-medium">Contexto adicional:</p>
          <p className="text-gray-600">{data.additional_context}</p>
        </div>
      )}
    </div>
  );
}
