
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";

export function getBusinessContextSummary(data: OnboardingData['business_context'] | undefined) {
  console.log("Gerando resumo para business_context:", data);
  
  // Se não há dados de contexto, verificar dados em business_data
  if (!data || Object.keys(data).length === 0) {
    // Tente acessar os dados no campo business_data se disponível
    data = (data as any)?.business_data;
    console.log("Tentando acessar dados em business_data:", data);
    
    if (!data || Object.keys(data).length === 0) {
      return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
    }
  }

  // Usar um objeto para mapear os IDs para nomes mais amigáveis
  const friendlyModels: Record<string, string> = {
    'b2b': 'B2B - Business to Business',
    'b2c': 'B2C - Business to Consumer',
    'b2b2c': 'B2B2C - Business to Business to Consumer',
    'd2c': 'D2C - Direct to Consumer',
    'saas': 'SaaS - Software as a Service',
    'marketplace': 'Marketplace',
    'ecommerce': 'E-commerce',
    'subscription': 'Assinatura / Recorrência',
    'freelancer': 'Freelancer / Autônomo',
    'consulting': 'Consultoria',
    'agency': 'Agência'
  };

  const friendlyChallenges: Record<string, string> = {
    'growth': 'Crescimento acelerado',
    'leads': 'Geração de leads qualificados',
    'automation': 'Automação de processos',
    'conversion': 'Conversão de vendas',
    'retention': 'Retenção de clientes',
    'ai-implementation': 'Implementação eficiente de IA',
    'data-analysis': 'Análise e uso efetivo de dados',
    'team-training': 'Capacitação de equipe em IA',
    'cost-optimization': 'Otimização de custos',
    'product-development': 'Desenvolvimento de novos produtos'
  };

  const friendlyKpis: Record<string, string> = {
    'revenue': 'Receita',
    'profit': 'Lucro',
    'customer-acquisition': 'Aquisição de Clientes',
    'customer-retention': 'Retenção de Clientes',
    'churn-rate': 'Taxa de Churn',
    'cac': 'CAC (Custo de Aquisição de Cliente)',
    'ltv': 'LTV (Valor do Tempo de Vida do Cliente)',
    'mrr': 'MRR (Receita Recorrente Mensal)',
    'conversion-rate': 'Taxa de Conversão',
    'operational-efficiency': 'Eficiência Operacional',
    'nps': 'NPS (Net Promoter Score)'
  };

  // Função para traduzir IDs para nomes amigáveis
  const translateId = (id: string, mapping: Record<string, string>) => {
    return mapping[id] || id;
  };

  return (
    <div className="space-y-2 text-sm">
      <p>
        <span className="font-medium">Modelo de negócio:</span> {
          data.business_model ? translateId(data.business_model, friendlyModels) : "Não preenchido"
        }
      </p>
      
      {data.business_challenges && Array.isArray(data.business_challenges) && data.business_challenges.length > 0 && (
        <div>
          <span className="font-medium">Desafios do negócio:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.business_challenges.map((challenge: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {translateId(challenge, friendlyChallenges)}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {data.important_kpis && Array.isArray(data.important_kpis) && data.important_kpis.length > 0 && (
        <div>
          <span className="font-medium">KPIs importantes:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.important_kpis.map((kpi: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {translateId(kpi, friendlyKpis)}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {data.short_term_goals && Array.isArray(data.short_term_goals) && data.short_term_goals.length > 0 && (
        <div>
          <span className="font-medium">Metas de curto prazo:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.short_term_goals.map((goal: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{goal}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {data.medium_term_goals && Array.isArray(data.medium_term_goals) && data.medium_term_goals.length > 0 && (
        <div>
          <span className="font-medium">Metas de médio prazo:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.medium_term_goals.map((goal: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{goal}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {data.additional_context && (
        <p><span className="font-medium">Contexto adicional:</span> {data.additional_context}</p>
      )}
    </div>
  );
}
