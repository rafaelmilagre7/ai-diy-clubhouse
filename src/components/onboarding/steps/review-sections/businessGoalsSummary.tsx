
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";

export function getBusinessGoalsSummary(data: OnboardingData['business_goals']) {
  console.log("Renderizando summary para Business Goals com dados:", data);
  
  // Verificação de dados
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  // Mapeamento para exibições mais amigáveis
  const howImplementMap: Record<string, string> = {
    'delegar_time': 'Colocar pessoa do time',
    'eu_mesmo': 'Eu mesmo vou implementar',
    'contratar_equipe': 'Contratar equipe VIVER DE IA'
  };

  return (
    <div className="space-y-2 text-sm">
      <p>
        <span className="font-medium">Objetivo principal:</span> {data.primary_goal || "Não preenchido"}
      </p>
      
      <p>
        <span className="font-medium">Resultado esperado em 30 dias:</span> {data.expected_outcome_30days || "Não preenchido"}
      </p>
      
      <p>
        <span className="font-medium">Tipo de solução prioritária:</span> {data.priority_solution_type || "Não preenchido"}
      </p>
      
      <p>
        <span className="font-medium">Como pretende implementar:</span> {
          data.how_implement 
            ? (howImplementMap[data.how_implement] || data.how_implement) 
            : "Não preenchido"
        }
      </p>
      
      <p>
        <span className="font-medium">Disponibilidade semanal:</span> {data.week_availability || "Não preenchido"}
      </p>
      
      {data.live_interest !== undefined && (
        <p>
          <span className="font-medium">Interesse em sessões ao vivo:</span> {data.live_interest}/10
        </p>
      )}
      
      {data.content_formats && Array.isArray(data.content_formats) && data.content_formats.length > 0 && (
        <div>
          <span className="font-medium">Formatos de conteúdo preferidos:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.content_formats.map((format: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{
                format === 'video' ? 'Vídeo' :
                format === 'texto' ? 'Texto' :
                format === 'audio' ? 'Áudio' :
                format === 'ao_vivo' ? 'Ao vivo' :
                format === 'workshop' ? 'Workshop prático' :
                format
              }</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
