
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";

export function getComplementaryInfoSummary(data: OnboardingData['complementary_info']) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  // Mapear os valores para rótulos mais legíveis
  const getDiscoverySourceLabel = (value: string): string => {
    const map: Record<string, string> = {
      "google": "Google",
      "social_media": "Redes Sociais",
      "instagram": "Instagram",
      "facebook": "Facebook",
      "linkedin": "LinkedIn",
      "youtube": "YouTube",
      "recommendation": "Recomendação",
      "event": "Evento",
      "podcast": "Podcast",
      "webinar": "Webinar",
      "news": "Notícia/Blog",
      "ads": "Anúncio",
      "partner": "Parceiro",
      "tiktok": "TikTok",
      "other": "Outro"
    };
    return map[value] || value;
  };

  const getTopicLabel = (value: string): string => {
    const map: Record<string, string> = {
      "ia_gerativa": "IA Gerativa",
      "assistentes_ia": "Assistentes de IA",
      "automacao": "Automação de Processos",
      "computer_vision": "Visão Computacional",
      "dados": "Análise de Dados",
      "seo": "SEO e Marketing Digital",
      "atendimento": "Atendimento ao Cliente",
      "vendas": "Vendas e Prospecção",
      "rh": "RH e Recrutamento",
      "financeiro": "Controle Financeiro",
      "produto": "Desenvolvimento de Produto",
      "suporte": "Suporte ao Cliente",
      "marketing": "Marketing Digital",
      "operacoes": "Operações",
      "estrategia": "Estratégia de Negócios"
    };
    return map[value] || value;
  };

  return (
    <div className="space-y-2 text-sm">
      <p><span className="font-medium">Como nos conheceu:</span> {data.how_found_us ? getDiscoverySourceLabel(data.how_found_us) : "Não preenchido"}</p>
      {data.referred_by && <p><span className="font-medium">Indicado por:</span> {data.referred_by}</p>}
      <p><span className="font-medium">Autoriza uso do caso:</span> {data.authorize_case_usage ? "Sim" : "Não"}</p>
      <p><span className="font-medium">Interesse em entrevista:</span> {data.interested_in_interview ? "Sim" : "Não"}</p>
      
      {data.priority_topics && data.priority_topics.length > 0 && (
        <div>
          <span className="font-medium">Tópicos prioritários:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.priority_topics.map((topic: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">{getTopicLabel(topic)}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
