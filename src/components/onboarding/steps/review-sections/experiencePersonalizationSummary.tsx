
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OnboardingData } from "@/types/onboarding";

// Função utilitária para traduzir valores de preferência de tempo
function translateTimePreference(value: string): string {
  const translations: Record<string, string> = {
    "manha": "Manhã (8h–12h)",
    "tarde": "Tarde (13h–18h)",
    "noite": "Noite (19h–22h)"
  };
  return translations[value] || value;
}

// Função utilitária para traduzir valores de interesses
function translateInterest(value: string): string {
  const translations: Record<string, string> = {
    "ia_generativa": "IA Generativa (GPT, Gemini, Claude)",
    "automacao": "Automação de Processos",
    "chatbots": "Chatbots e Assistentes Virtuais",
    "voice_ia": "IA de Voz e Reconhecimento de Fala",
    "analise_ia": "Análise de dados com IA"
  };
  return translations[value] || value;
}

// Função utilitária para traduzir habilidades
function translateSkill(value: string): string {
  const translations: Record<string, string> = {
    "engenharia_prompts": "Engenharia de prompts",
    "integracao_apis": "Integração de APIs de IA",
    "vendas_ia": "Vendas potencializadas por IA",
    "criacao_conteudo": "Criação de conteúdo com IA",
    "gestao_projetos": "Gestão de projetos de tecnologia",
    "desenvolvimento_chatbots": "Desenvolvimento de chatbots",
    "marketing_digital": "Marketing digital com IA",
    "automacao_no_code": "Automação de processos (no-code)",
    "desenvolvimento_produtos_digitais": "Desenvolvimento de produtos digitais",
    "analise_dados_bi": "Análise de dados e Business Intelligence"
  };
  return translations[value] || value;
}

// Função utilitária para traduzir tópicos de mentoria
function translateMentorshipTopic(value: string): string {
  const translations: Record<string, string> = {
    "implementacao_pratica": "Implementação prática de IA no negócio",
    "engenharia_prompts": "Engenharia de prompts avançada",
    "automacao_processos": "Automação de processos com no-code",
    "escalabilidade": "Escalabilidade de soluções de IA",
    "marketing_geracao": "Marketing e geração de leads com IA",
    "monetizacao": "Monetização de soluções de IA",
    "criacao_assistentes": "Criação de assistentes personalizados",
    "integracao_ferramentas": "Integração de múltiplas ferramentas de IA",
    "vendas_prospeccao": "Vendas e prospecção com IA",
    "conteudo_estrategico": "Criação de conteúdo estratégico com IA"
  };
  return translations[value] || value;
}

export function getExperiencePersonalizationSummary(data: OnboardingData['experience_personalization']) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  return (
    <div className="space-y-3 text-sm">
      {data.interests && data.interests.length > 0 && (
        <div>
          <span className="font-medium">Áreas de interesse:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.interests.map((interest: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {translateInterest(interest)}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {data.time_preference && data.time_preference.length > 0 && (
        <div>
          <span className="font-medium">Preferência de horário:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.time_preference.map((time: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {translateTimePreference(time)}
              </Badge>
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
      
      <div>
        <span className="font-medium">Disponibilidade para networking:</span> 
        {typeof data.networking_availability === 'number' 
          ? <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded text-sm">{data.networking_availability}/10</span>
          : <span className="text-gray-500 italic ml-1">Não preenchido</span>
        }
      </div>
      
      {data.skills_to_share && data.skills_to_share.length > 0 && (
        <div>
          <span className="font-medium">Habilidades para compartilhar:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.skills_to_share.map((skill: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {translateSkill(skill)}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {data.mentorship_topics && data.mentorship_topics.length > 0 && (
        <div>
          <span className="font-medium">Tópicos de interesse para mentoria:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.mentorship_topics.map((topic: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {translateMentorshipTopic(topic)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
