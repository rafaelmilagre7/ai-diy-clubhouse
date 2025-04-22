
import React from "react";

export function getBusinessGoalsSummary(data: any) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      <p><span className="font-medium">Objetivo principal:</span> {data.primary_goal || "Não preenchido"}</p>
      
      {data.expected_outcomes && data.expected_outcomes.length > 0 && (
        <div>
          <p className="font-medium">Resultados esperados:</p>
          <ul className="list-disc pl-5">
            {data.expected_outcomes.map((outcome: string, index: number) => (
              <li key={index}>{outcome}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.expected_outcome_30days && (
        <p><span className="font-medium">Expectativa para 30 dias:</span> {data.expected_outcome_30days}</p>
      )}
      
      {data.timeline && (
        <p><span className="font-medium">Prazo estimado:</span> {data.timeline}</p>
      )}
      
      <p><span className="font-medium">Tipo de solução prioritária:</span> {data.priority_solution_type || "Não preenchido"}</p>
      
      <p><span className="font-medium">Como implementar:</span> {data.how_implement || "Não preenchido"}</p>
      
      <p><span className="font-medium">Disponibilidade semanal:</span> {data.week_availability || "Não preenchido"}</p>
      
      {data.live_interest !== undefined && (
        <p><span className="font-medium">Interesse em sessões ao vivo:</span> {data.live_interest}/10</p>
      )}
      
      {data.content_formats && data.content_formats.length > 0 && (
        <div>
          <p className="font-medium">Formatos de conteúdo preferidos:</p>
          <ul className="list-disc pl-5">
            {data.content_formats.map((format: string, index: number) => (
              <li key={index}>{format}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
