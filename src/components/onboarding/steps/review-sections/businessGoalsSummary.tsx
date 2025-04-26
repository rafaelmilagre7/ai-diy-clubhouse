
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
  if ((!processedData.primary_goal || processedData.primary_goal === '') && 
      (!processedData.expected_outcomes || processedData.expected_outcomes.length === 0)) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  // Funções para mapear valores para rótulos mais legíveis
  const getPrimaryGoalLabel = (value: string) => {
    const map: Record<string, string> = {
      "improve_marketing": "Melhorar marketing e vendas",
      "optimize_workflow": "Otimizar fluxo de trabalho",
      "enhance_product": "Aprimorar produto ou serviço",
      "customer_service": "Melhorar atendimento ao cliente",
      "reduce_costs": "Reduzir custos operacionais",
      "other": "Outro objetivo"
    };
    return map[value] || value;
  };
  
  const getImplementationLabel = (value: string) => {
    const map: Record<string, string> = {
      "myself": "Implementar sozinho",
      "with_team": "Implementar com minha equipe",
      "hire_developer": "Contratar desenvolvedor",
      "undecided": "Ainda não decidi"
    };
    return map[value] || value;
  };
  
  const getTimelineLabel = (value: string) => {
    const map: Record<string, string> = {
      "asap": "O mais rápido possível",
      "30days": "Próximos 30 dias",
      "60days": "Próximos 60 dias",
      "90days": "Próximos 90 dias",
      "learn_only": "Apenas aprendizado"
    };
    return map[value] || value;
  };
  
  const getSolutionTypeLabel = (value: string) => {
    const map: Record<string, string> = {
      "implementation": "Implementação rápida",
      "personalized": "Solução personalizada",
      "learning": "Aprendizado e formação",
      "unsure": "Não tenho certeza"
    };
    return map[value] || value;
  };
  
  const getWeekAvailabilityLabel = (value: string) => {
    const map: Record<string, string> = {
      "1-2h": "1-2 horas por semana",
      "3-5h": "3-5 horas por semana",
      "6-10h": "6-10 horas por semana",
      "10+h": "Mais de 10 horas por semana"
    };
    return map[value] || value;
  };
  
  const getContentFormatLabel = (value: string) => {
    const map: Record<string, string> = {
      "videos": "Vídeos",
      "articles": "Artigos",
      "workshops": "Workshops",
      "live_events": "Eventos ao vivo",
      "templates": "Templates",
      "guides": "Guias práticos",
      "community": "Discussões na comunidade"
    };
    return map[value] || value;
  };

  return (
    <div className="space-y-3 text-sm">
      <p>
        <span className="font-medium">Objetivo principal:</span>{" "}
        {processedData.primary_goal ? getPrimaryGoalLabel(processedData.primary_goal) : "Não preenchido"}
      </p>
      
      {processedData.expected_outcomes && processedData.expected_outcomes.length > 0 && (
        <div>
          <span className="font-medium">Resultados esperados:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {processedData.expected_outcomes.map((outcome: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {outcome}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {processedData.expected_outcome_30days && (
        <p>
          <span className="font-medium">Resultado em 30 dias:</span>{" "}
          {processedData.expected_outcome_30days}
        </p>
      )}
      
      <p>
        <span className="font-medium">Prazo de implementação:</span>{" "}
        {processedData.timeline ? getTimelineLabel(processedData.timeline) : "Não definido"}
      </p>
      
      <p>
        <span className="font-medium">Tipo de solução prioritária:</span>{" "}
        {processedData.priority_solution_type ? getSolutionTypeLabel(processedData.priority_solution_type) : "Não definido"}
      </p>
      
      <p>
        <span className="font-medium">Como pretende implementar:</span>{" "}
        {processedData.how_implement ? getImplementationLabel(processedData.how_implement) : "Não definido"}
      </p>
      
      <p>
        <span className="font-medium">Disponibilidade semanal:</span>{" "}
        {processedData.week_availability ? getWeekAvailabilityLabel(processedData.week_availability) : "Não definido"}
      </p>
      
      {typeof processedData.live_interest === 'number' && (
        <p>
          <span className="font-medium">Interesse em lives:</span>{" "}
          {processedData.live_interest}/10
        </p>
      )}
      
      {processedData.content_formats && processedData.content_formats.length > 0 && (
        <div>
          <span className="font-medium">Formatos de conteúdo preferidos:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {processedData.content_formats.map((format: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {getContentFormatLabel(format)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
