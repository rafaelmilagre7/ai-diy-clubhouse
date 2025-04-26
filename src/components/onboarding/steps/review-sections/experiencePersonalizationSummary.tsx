
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

// Função para garantir que os dados são um objeto válido
function ensureObject(data: any): Record<string, any> {
  console.log("[experiencePersonalizationSummary] Verificando dados:", data, typeof data);
  
  if (!data) return {};
  
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("[experiencePersonalizationSummary] Erro ao analisar string:", e);
      return {};
    }
  }
  
  return data;
}

export function getExperiencePersonalizationSummary(data: any) {
  console.log("[experiencePersonalizationSummary] Renderizando summary:", data);
  
  // Verificação de dados
  if (!data) {
    console.warn("[experiencePersonalizationSummary] Dados vazios");
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }
  
  // Garantir que estamos trabalhando com um objeto
  const personalization = ensureObject(data);
  console.log("[experiencePersonalizationSummary] Dados processados:", personalization);
  
  // Se após processamento os dados estiverem vazios
  if (Object.keys(personalization).length === 0) {
    console.warn("[experiencePersonalizationSummary] Objeto vazio após processamento");
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }

  // Verificar dados antigos e novos formatos para compatibilidade
  const interests = personalization.interests || [];
  const preferredTimes = personalization.preferred_times || personalization.time_preference || [];
  const daysAvailable = personalization.days_available || personalization.available_days || [];
  const networkingLevel = personalization.networking_level || personalization.networking_availability || 0;
  const shareableSkills = personalization.shareable_skills || personalization.skills_to_share || [];
  const mentorshipTopics = personalization.mentorship_topics || [];

  return (
    <div className="space-y-3 text-sm">
      {interests.length > 0 && (
        <div>
          <span className="font-medium">Interesses em IA:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {interests.map((interest: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {translateInterest(interest)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {preferredTimes.length > 0 && (
        <div>
          <span className="font-medium">Preferências de horário:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {preferredTimes.map((pref: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {translateTimePreference(pref)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {daysAvailable.length > 0 && (
        <div>
          <span className="font-medium">Dias disponíveis:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {daysAvailable.map((day: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {day}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {networkingLevel !== undefined && (
        <p>
          <span className="font-medium">Disponibilidade para networking:</span> {networkingLevel}/10
        </p>
      )}

      {shareableSkills.length > 0 && (
        <div>
          <span className="font-medium">Habilidades para compartilhar:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {shareableSkills.map((skill: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {translateSkill(skill)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {mentorshipTopics.length > 0 && (
        <div>
          <span className="font-medium">Tópicos para mentoria:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {mentorshipTopics.map((topic: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {translateMentorshipTopic(topic)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Exibir mensagem se nenhum dado válido foi encontrado */}
      {!interests.length && !preferredTimes.length && !daysAvailable.length && 
       !shareableSkills.length && !mentorshipTopics.length && networkingLevel === undefined && (
        <p className="text-gray-500 italic">Dados incompletos. Clique em Editar para preencher.</p>
      )}
    </div>
  );
}
