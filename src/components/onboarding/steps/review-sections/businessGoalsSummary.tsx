
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";

export function getBusinessGoalsSummary(data: OnboardingData['business_goals']) {
  console.log("Renderizando summary para Business Goals com dados:", data);
  
  // Verificação de dados
  if (!data || typeof data === 'string' || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  // Tentar converter string para objeto, se necessário
  let processedData = data;
  if (typeof data === 'string') {
    try {
      processedData = JSON.parse(data);
    } catch (e) {
      console.error("Erro ao converter string para objeto:", e);
      return (
        <p className="text-gray-500 italic">
          Erro ao processar dados. Clique em Editar para preencher novamente.
        </p>
      );
    }
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
        <span className="font-medium">Objetivo principal:</span> {processedData.primary_goal || "Não preenchido"}
      </p>
      
      <p>
        <span className="font-medium">Resultado esperado em 30 dias:</span> {processedData.expected_outcome_30days || "Não preenchido"}
      </p>
      
      <p>
        <span className="font-medium">Tipo de solução prioritária:</span> {processedData.priority_solution_type || "Não preenchido"}
      </p>
      
      <p>
        <span className="font-medium">Como pretende implementar:</span> {
          processedData.how_implement 
            ? (howImplementMap[processedData.how_implement] || processedData.how_implement) 
            : "Não preenchido"
        }
      </p>
      
      <p>
        <span className="font-medium">Disponibilidade semanal:</span> {processedData.week_availability || "Não preenchido"}
      </p>
      
      {processedData.live_interest !== undefined && (
        <p>
          <span className="font-medium">Interesse em sessões ao vivo:</span> {processedData.live_interest}/10
        </p>
      )}
      
      {processedData.content_formats && Array.isArray(processedData.content_formats) && processedData.content_formats.length > 0 && (
        <div>
          <span className="font-medium">Formatos de conteúdo preferidos:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {processedData.content_formats.map((format: string, index: number) => (
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
