
import React from "react";
import { Badge } from "@/components/ui/badge";
import { normalizeBusinessGoals } from "@/hooks/onboarding/persistence/utils/dataNormalization";

export function getBusinessGoalsSummary(data: any) {
  console.log("[BusinessGoalsSummary] Renderizando com dados:", data);
  
  // Verificação de dados
  if (!data) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }
  
  // Normalizar dados para garantir formato consistente
  const processedData = normalizeBusinessGoals(data);
  console.log("[BusinessGoalsSummary] Dados após normalização:", processedData);
  
  // Se mesmo após processamento os dados estiverem vazios ou não tiverem informações relevantes
  // Verificação mais robusta considerando tanto arrays vazios quanto objetivos selecionados
  const hasNoRelevantData = 
    (!processedData.expected_outcomes || processedData.expected_outcomes.length === 0) &&
    // Verificar objetivos do formato antigo também
    (typeof processedData === 'object' && Object.keys(processedData)
      .filter(key => key !== 'primary_goal' && key !== 'timeline' && processedData[key] === true)
      .length === 0);

  if (hasNoRelevantData) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  // Verificar se temos dados no formato de objetivos booleanos (novo formato)
  const hasObjectiveSelections = typeof processedData === 'object' && 
    Object.keys(processedData).some(key => key !== 'primary_goal' && key !== 'timeline' && processedData[key] === true);

  // Função para obter rótulos legíveis para cada ID de objetivo
  const getGoalLabel = (goalId: string) => {
    const labels: Record<string, string> = {
      // Objetivos de negócio
      'vendas': 'Aumentar vendas',
      'leads': 'Gerar mais leads',
      'marketing': 'Otimizar marketing',
      'automacao': 'Automatizar processos',
      'atendimento': 'Melhorar atendimento',
      'processos': 'Aprimorar processos',
      'decisoes': 'Melhorar decisões',
      'escala': 'Escalar operações',
      'inovacao': 'Criar novas soluções',
      
      // Formato legado
      "improve_marketing": "Melhorar marketing e vendas",
      "optimize_workflow": "Otimizar fluxo de trabalho",
      "enhance_product": "Aprimorar produto ou serviço",
      "customer_service": "Melhorar atendimento ao cliente",
      "reduce_costs": "Reduzir custos operacionais",
      "other": "Outro objetivo"
    };
    return labels[goalId] || goalId;
  };

  // Se estamos usando o formato antigo (com expected_outcomes como array)
  if (Array.isArray(processedData.expected_outcomes) && processedData.expected_outcomes.length > 0) {
    return (
      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium">Objetivos selecionados:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {processedData.expected_outcomes.map((outcome: string, index: number) => (
              <Badge key={index} variant="dark-outline">
                {getGoalLabel(outcome)}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Se estamos usando o novo formato (com objetivos como chaves booleanas)
  if (hasObjectiveSelections) {
    // Filtrar apenas as chaves que são true (objetivos selecionados)
    const selectedObjectives = Object.keys(processedData)
      .filter(key => key !== 'primary_goal' && key !== 'timeline' && processedData[key] === true);
      
    return (
      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium">Objetivos selecionados:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedObjectives.map((goalId: string, index: number) => (
              <Badge key={index} variant="dark-outline">
                {getGoalLabel(goalId)}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fallback para outros formatos ou dados não reconhecidos
  return (
    <div className="space-y-3 text-sm">
      <p>
        <span className="font-medium">Dados enviados em formato alternativo.</span>
      </p>
    </div>
  );
}
