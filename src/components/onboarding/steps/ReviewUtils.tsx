
import React from "react";
import { Badge } from "@/components/ui/badge";

export function getSummary(section: string, data: any, progress: any) {
  // Se não tiver dados, mostrar mensagem para o usuário editar
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  if (section === "personal_info") {
    return (
      <div className="space-y-2 text-sm">
        <p><span className="font-medium">Nome:</span> {data.name || "Não preenchido"}</p>
        <p><span className="font-medium">Email:</span> {data.email || "Não preenchido"}</p>
        <p><span className="font-medium">Telefone:</span> {data.phone ? `+${data.ddi || "55"} ${data.phone}` : "Não preenchido"}</p>
        <p><span className="font-medium">Localização:</span> {data.city && data.state ? `${data.city}, ${data.state}, ${data.country || "Brasil"}` : "Não preenchido"}</p>
        {data.linkedin && <p><span className="font-medium">LinkedIn:</span> {data.linkedin}</p>}
        {data.instagram && <p><span className="font-medium">Instagram:</span> {data.instagram}</p>}
      </div>
    );
  }

  if (section === "professional_info") {
    return (
      <div className="space-y-2 text-sm">
        <p><span className="font-medium">Empresa:</span> {data.company_name || progress.company_name || "Não preenchido"}</p>
        <p><span className="font-medium">Cargo atual:</span> {data.current_position || progress.current_position || "Não preenchido"}</p>
        <p><span className="font-medium">Tamanho da empresa:</span> {data.company_size || progress.company_size || "Não preenchido"}</p>
        <p><span className="font-medium">Setor:</span> {data.company_sector || progress.company_sector || "Não preenchido"}</p>
        <p><span className="font-medium">Faturamento anual:</span> {data.annual_revenue || progress.annual_revenue || "Não preenchido"}</p>
        {data.company_website && <p><span className="font-medium">Website:</span> {data.company_website}</p>}
      </div>
    );
  }

  if (section === "business_context") {
    return (
      <div className="space-y-2 text-sm">
        <p><span className="font-medium">Modelo de negócio:</span> {data.business_model || "Não preenchido"}</p>
        
        {data.business_challenges && data.business_challenges.length > 0 && (
          <div>
            <span className="font-medium">Desafios do negócio:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.business_challenges.map((challenge: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-gray-100">{challenge}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {data.important_kpis && data.important_kpis.length > 0 && (
          <div>
            <span className="font-medium">KPIs importantes:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.important_kpis.map((kpi: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-gray-100">{kpi}</Badge>
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

  if (section === "ai_experience") {
    return (
      <div className="space-y-2 text-sm">
        <p><span className="font-medium">Nível de conhecimento em IA:</span> {data.knowledge_level || "Não preenchido"}</p>
        
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
        
        {data.desired_ai_areas && data.desired_ai_areas.length > 0 && (
          <div>
            <span className="font-medium">Áreas de interesse em IA:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.desired_ai_areas.map((area: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-gray-100">{area}</Badge>
              ))}
            </div>
          </div>
        )}
        
        <p><span className="font-medium">Já implementou soluções de IA:</span> {data.has_implemented === "sim" ? "Sim" : "Não"}</p>
      </div>
    );
  }

  if (section === "business_goals") {
    return (
      <div className="space-y-2 text-sm">
        <p><span className="font-medium">Objetivo principal:</span> {data.primary_goal || "Não preenchido"}</p>
        
        {data.expected_outcomes && data.expected_outcomes.length > 0 && (
          <div>
            <span className="font-medium">Resultados esperados:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.expected_outcomes.map((outcome: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-gray-100">{outcome}</Badge>
              ))}
            </div>
          </div>
        )}
        
        <p><span className="font-medium">Resultado esperado em 30 dias:</span> {data.expected_outcome_30days || "Não preenchido"}</p>
        <p><span className="font-medium">Linha de tempo:</span> {data.timeline || "Não preenchido"}</p>
        <p><span className="font-medium">Tipo de solução prioritária:</span> {data.priority_solution_type || "Não preenchido"}</p>
      </div>
    );
  }

  if (section === "experience_personalization") {
    return (
      <div className="space-y-2 text-sm">
        {data.interests && data.interests.length > 0 && (
          <div>
            <span className="font-medium">Áreas de interesse:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.interests.map((interest: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-gray-100">{interest}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {data.time_preference && data.time_preference.length > 0 && (
          <div>
            <span className="font-medium">Preferência de horário:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.time_preference.map((time: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-gray-100">{time}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {data.available_days && data.available_days.length > 0 && (
          <div>
            <span className="font-medium">Dias disponíveis:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.available_days.map((day: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-gray-100">{day}</Badge>
              ))}
            </div>
          </div>
        )}
        
        <p><span className="font-medium">Disponibilidade para networking:</span> {data.networking_availability ? `${data.networking_availability}/10` : "Não preenchido"}</p>
      </div>
    );
  }

  if (section === "complementary_info") {
    return (
      <div className="space-y-2 text-sm">
        <p><span className="font-medium">Como nos conheceu:</span> {data.how_found_us || "Não preenchido"}</p>
        {data.referred_by && <p><span className="font-medium">Indicado por:</span> {data.referred_by}</p>}
        <p><span className="font-medium">Autoriza uso do caso:</span> {data.authorize_case_usage ? "Sim" : "Não"}</p>
        <p><span className="font-medium">Interesse em entrevista:</span> {data.interested_in_interview ? "Sim" : "Não"}</p>
        
        {data.priority_topics && data.priority_topics.length > 0 && (
          <div>
            <span className="font-medium">Tópicos prioritários:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.priority_topics.map((topic: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-gray-100">{topic}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Para outros tipos não implementados especificamente
  return (
    <div className="space-y-1 text-sm text-gray-600">
      {Object.entries(data).map(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          return (
            <div key={key} className="mb-2">
              <span className="font-medium text-gray-700">{formatKey(key)}:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {value.map((item: any, index: number) => (
                  <Badge key={index} variant="outline" className="bg-gray-100">
                    {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                  </Badge>
                ))}
              </div>
            </div>
          );
        } else if (typeof value === 'boolean') {
          return (
            <p key={key}>
              <span className="font-medium text-gray-700">{formatKey(key)}:</span> {value ? "Sim" : "Não"}
            </p>
          );
        } else if (value && typeof value !== 'object') {
          return (
            <p key={key}>
              <span className="font-medium text-gray-700">{formatKey(key)}:</span> {String(value)}
            </p>
          );
        } else if (typeof value === 'object' && value !== null) {
          return (
            <div key={key} className="mb-2">
              <span className="font-medium text-gray-700">{formatKey(key)}:</span>
              <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-20">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

// Função para formatar as chaves para exibição
function formatKey(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
