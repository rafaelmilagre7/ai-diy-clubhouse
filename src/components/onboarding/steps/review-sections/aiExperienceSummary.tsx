
import React from "react";

export function getAIExperienceSummary(data: any) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  // Mapear nível de conhecimento para texto mais legível
  const knowledgeLevelMap: Record<string, string> = {
    "beginner": "Iniciante",
    "intermediate": "Intermediário",
    "advanced": "Avançado",
    "expert": "Especialista"
  };

  return (
    <div className="space-y-2 text-sm">
      <p>
        <span className="font-medium">Nível de conhecimento:</span> {
          knowledgeLevelMap[data.knowledge_level] || data.knowledge_level || "Não preenchido"
        }
      </p>
      
      {data.previous_tools && data.previous_tools.length > 0 && (
        <div>
          <p className="font-medium">Ferramentas utilizadas anteriormente:</p>
          <ul className="list-disc pl-5">
            {data.previous_tools.map((tool: string, index: number) => (
              <li key={index}>{tool}</li>
            ))}
          </ul>
        </div>
      )}
      
      <p>
        <span className="font-medium">Já implementou IA:</span> {
          data.has_implemented === "sim" || data.has_implemented === "true" || data.has_implemented === true
            ? "Sim"
            : "Não"
        }
      </p>
      
      {data.desired_ai_areas && data.desired_ai_areas.length > 0 && (
        <div>
          <p className="font-medium">Áreas de interesse em IA:</p>
          <ul className="list-disc pl-5">
            {data.desired_ai_areas.map((area: string, index: number) => (
              <li key={index}>{area}</li>
            ))}
          </ul>
        </div>
      )}
      
      {data.nps_score !== undefined && (
        <p><span className="font-medium">Satisfação com IA (0-10):</span> {data.nps_score}</p>
      )}
      
      {data.improvement_suggestions && (
        <div>
          <p className="font-medium">Sugestões de melhoria:</p>
          <p className="text-gray-600">{data.improvement_suggestions}</p>
        </div>
      )}
    </div>
  );
}
