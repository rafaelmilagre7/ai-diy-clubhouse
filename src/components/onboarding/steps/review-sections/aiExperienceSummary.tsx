
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";

export function getAIExperienceSummary(data: OnboardingData['ai_experience']) {
  console.log("Renderizando summary para AI Experience com dados:", data);
  
  // Verificar se os dados estão em formato correto
  if (!data || typeof data === 'string' || Object.keys(data).length === 0) {
    console.warn("Dados de AI Experience inválidos ou vazios:", data);
    return (
      <p className="text-gray-500 italic">
        Seção não preenchida ou dados incompletos. Clique em Editar para preencher.
      </p>
    );
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

  // Mapeamento de níveis para exibição mais amigável
  const knowledgeLevelMap: Record<string, string> = {
    'iniciante': 'Iniciante – Estou começando agora',
    'basico': 'Básico – Já experimentei algumas ferramentas',
    'intermediario': 'Intermediário – Uso regularmente',
    'avancado': 'Avançado – Uso frequentemente e conheço bem',
    'especialista': 'Especialista – Trabalho profissionalmente com IA'
  };

  // Mapeamento de áreas desejadas
  const areaMap: Record<string, string> = {
    'vendas': 'Soluções de IA para Vendas',
    'marketing': 'Soluções de IA para Marketing',
    'rh': 'Soluções de IA para RH',
    'analise_dados': 'Soluções de IA para Análise de Dados'
  };

  // Modificar a verificação de has_implemented para ser mais robusta
  const hasImplemented = () => {
    const value = processedData.has_implemented;
    
    // Tratar casos onde has_implemented pode ser string ou boolean
    if (typeof value === 'boolean') {
      return value;
    }
    
    if (typeof value === 'string') {
      return value === "true" || value === "sim";
    }
    
    // Caso padrão, retornar false se não for possível determinar
    return false;
  };

  return (
    <div className="space-y-3 text-sm">
      <p>
        <span className="font-medium">Nível de conhecimento em IA:</span> {
          processedData.knowledge_level 
            ? (knowledgeLevelMap[processedData.knowledge_level] || processedData.knowledge_level) 
            : "Não preenchido"
        }
      </p>
      
      {processedData.previous_tools && Array.isArray(processedData.previous_tools) && processedData.previous_tools.length > 0 && (
        <div>
          <span className="font-medium">Ferramentas já utilizadas:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {processedData.previous_tools.map((tool: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{tool}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Verificar se desired_ai_areas existe e é um array */}
      {processedData.desired_ai_areas && Array.isArray(processedData.desired_ai_areas) && processedData.desired_ai_areas.length > 0 && (
        <div>
          <span className="font-medium">Áreas de interesse em IA:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {processedData.desired_ai_areas.map((area: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {areaMap[area] || area}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <p>
        <span className="font-medium">Já implementou soluções de IA:</span> {
          hasImplemented() ? "Sim" : "Não"
        }
      </p>
      
      {processedData.nps_score !== undefined && (
        <p><span className="font-medium">Avaliação da experiência (NPS):</span> {processedData.nps_score}/10</p>
      )}
      
      {processedData.completed_formation && (
        <p><span className="font-medium">Formação completada:</span> Sim</p>
      )}
      
      {processedData.improvement_suggestions && (
        <div>
          <p className="font-medium">Sugestões de melhoria:</p>
          <p className="text-gray-600 mt-1 bg-gray-50 p-2 rounded border border-gray-100">
            {processedData.improvement_suggestions}
          </p>
        </div>
      )}
    </div>
  );
}
