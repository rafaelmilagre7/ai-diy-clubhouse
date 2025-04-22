
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";
import { normalizeBusinessGoals } from "@/hooks/onboarding/persistence/utils/dataNormalization";

// Função para garantir que os dados são um objeto válido
function ensureObject(data: any): Record<string, any> {
  if (!data) return {};
  
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Erro ao analisar string como JSON:", e);
      return {};
    }
  }
  
  return data;
}

export function getBusinessGoalsSummary(data: OnboardingData['business_goals'] | any) {
  console.log("Renderizando summary para seção business_goals com dados:", data);
  
  // Verificação de dados
  if (!data) {
    console.warn("Dados vazios para seção business_goals");
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  // Garantir que estamos trabalhando com um objeto
  const processedData = ensureObject(data);

  // Se mesmo após processamento os dados estiverem vazios
  if (Object.keys(processedData).length === 0) {
    console.warn("Objeto vazio após processamento para seção business_goals");
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  // Mapeamento para exibições mais amigáveis
  const howImplementMap: Record<string, string> = {
    'delegar_time': 'Colocar pessoa do time',
    'eu_mesmo': 'Eu mesmo vou implementar',
    'contratar_equipe': 'Contratar equipe VIVER DE IA'
  };

  // Mapeamento para exibição de motivos
  const motivosMap: Record<string, string> = {
    'networking': 'Networking com outros empresários',
    'aprofundar_conhecimento': 'Aprofundar conhecimento em IA',
    'implementar_solucoes': 'Implementar soluções concretas',
    'be_atualizado': 'Manter-me atualizado sobre IA',
    'mentoria': 'Mentoria para implementar IA',
    'aprender_ferramentas': 'Aprender ferramentas práticas',
    'capacitar_time': 'Capacitar meu time em IA',
    'comunidade': 'Fazer parte de uma comunidade de IA'
  };

  // Mapeamento para formatação de conteúdo
  const formatosMap: Record<string, string> = {
    'video': 'Vídeo',
    'texto': 'Texto',
    'audio': 'Áudio',
    'ao_vivo': 'Ao vivo',
    'workshop': 'Workshop prático'
  };

  return (
    <div className="space-y-2 text-sm">
      {processedData.primary_goal && (
        <p>
          <span className="font-medium">Objetivo principal:</span> {
            motivosMap[processedData.primary_goal] || processedData.primary_goal
          }
        </p>
      )}
      
      {processedData.expected_outcome_30days && (
        <p>
          <span className="font-medium">Resultado esperado em 30 dias:</span> {processedData.expected_outcome_30days}
        </p>
      )}
      
      {processedData.priority_solution_type && (
        <p>
          <span className="font-medium">Tipo de solução prioritária:</span> {processedData.priority_solution_type}
        </p>
      )}
      
      {processedData.how_implement && (
        <p>
          <span className="font-medium">Como pretende implementar:</span> {
            howImplementMap[processedData.how_implement] || processedData.how_implement
          }
        </p>
      )}
      
      {processedData.week_availability && (
        <p>
          <span className="font-medium">Disponibilidade semanal:</span> {processedData.week_availability}
        </p>
      )}
      
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
                formatosMap[format] || format
              }</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
