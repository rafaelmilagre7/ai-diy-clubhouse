
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";

export function getAIExperienceSummary(data: OnboardingData['ai_experience']) {
  console.log("Renderizando summary para AI Experience com dados:", data);
  
  // Verificar se os dados estão em formato correto
  if (!data || typeof data === 'string' || Object.keys(data).length === 0) {
    console.warn("Dados de AI Experience inválidos ou vazios:", data);
    return <p className="text-gray-500 italic">Seção não preenchida ou dados incompletos. Clique em Editar para preencher.</p>;
  }

  // Mapeamento de níveis para exibição mais amigável
  const knowledgeLevelMap: Record<string, string> = {
    'iniciante': 'Iniciante – Estou começando agora',
    'basico': 'Básico – Já experimentei algumas ferramentas',
    'intermediario': 'Intermediário – Uso regularmente',
    'avancado': 'Avançado – Uso frequentemente e conheço bem',
    'especialista': 'Especialista – Trabalho profissionalmente com IA'
  };

  return (
    <div className="space-y-2 text-sm">
      <p>
        <span className="font-medium">Nível de conhecimento em IA:</span> {
          data.knowledge_level ? (knowledgeLevelMap[data.knowledge_level] || data.knowledge_level) : "Não preenchido"
        }
      </p>
      
      {data.previous_tools && data.previous_tools.length > 0 && (
        <div>
          <span className="font-medium">Ferramentas já utilizadas:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.previous_tools.map((tool: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{tool}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Verificar se desired_ai_areas existe e é um array */}
      {data.desired_ai_areas && Array.isArray(data.desired_ai_areas) && data.desired_ai_areas.length > 0 && (
        <div>
          <span className="font-medium">Áreas de interesse em IA:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.desired_ai_areas.map((area: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{area}</Badge>
            ))}
          </div>
        </div>
      )}
      
      <p>
        <span className="font-medium">Já implementou soluções de IA:</span> {
          data.has_implemented === "sim" || data.has_implemented === "true" ? "Sim" : "Não"
        }
      </p>
      
      {data.nps_score !== undefined && (
        <p><span className="font-medium">Avaliação da experiência (NPS):</span> {data.nps_score}/10</p>
      )}
      
      {data.completed_formation && (
        <p><span className="font-medium">Formação completada:</span> Sim</p>
      )}
      
      {data.improvement_suggestions && (
        <p><span className="font-medium">Sugestões de melhoria:</span> {data.improvement_suggestions}</p>
      )}
    </div>
  );
}
