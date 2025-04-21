
import React from "react";
import {
  businessModelMap,
  businessChallengesMap,
  shortTermGoalsMap,
  mediumTermGoalsMap,
  kpiMap,
  motivosMap,
  implementMap,
  formatoMap,
  knowledgeLevelMap,
  aiAreasMap,
  interestsMap,
  timePreferenceMap,
  skillsMap,
  mentorshipMap,
  topicsMap
} from "./ReviewMappings";
import { OnboardingProgress } from "@/types/onboarding";

// Função para traduzir arrays de IDs para seus valores legíveis
export function translateArray(array: string[] | undefined, map: {[key: string]: string}) {
  if (!array || array.length === 0) return [];
  return array.map(id => map[id] || id);
}

// Função para resumir cada etapa
export function getSummary(section: string, data: any, progress: OnboardingProgress) {
  if (!data) return "Nenhuma informação fornecida";

  switch (section) {
    case "personal_info":
      return (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p><strong>Nome:</strong> {data.name || "Não informado"}</p>
          <p><strong>E-mail:</strong> {data.email || "Não informado"}</p>
          <p>
            <strong>Telefone:</strong>{" "}
            {data.phone ?  `${data.ddi?.replace(/^(\+)?\+?/, "+") || "+55"} ${data.phone}` : "Não informado"}
          </p>
          <p>
            <strong>Localização:</strong>{" "}
            {[data.city, data.state, data.country].filter(Boolean).join(", ") || "Não informada"}
          </p>
          <p><strong>LinkedIn:</strong> {data.linkedin || "Não informado"}</p>
          <p><strong>Instagram:</strong> {data.instagram || "Não informado"}</p>
        </div>
      );
    case "professional_info":
      return (
        <div className="grid grid-cols-1 gap-2 text-sm">
          <p><strong>Empresa:</strong> {data.company_name || progress.company_name || "Não informada"}</p>
          <p><strong>Tamanho da empresa:</strong> {data.company_size || progress.company_size || "Não informado"}</p>
          <p><strong>Setor:</strong> {data.company_sector || progress.company_sector || "Não informado"}</p>
          <p><strong>Site:</strong> {data.company_website || progress.company_website || "Não informado"}</p>
          <p><strong>Cargo atual:</strong> {data.current_position || progress.current_position || "Não informado"}</p>
          <p><strong>Faturamento anual:</strong> {data.annual_revenue || progress.annual_revenue || "Não informado"}</p>
        </div>
      );
    case "business_context":
      const businessData = data || progress.business_data || {};
      // Aqui faz o "fallback" para exibir tanto valor em português já, quanto "em inglês" se for o caso,
      // mas preferindo português se disponível (pois pode ter sido preenchido pelo usuário).
      const businessModel = businessData.business_model && businessModelMap[businessData.business_model]
        ? businessModelMap[businessData.business_model]
        : businessData.business_model;
      const challenges = businessData.business_challenges
        ? businessData.business_challenges.map((val: string) =>
            businessChallengesMap[val] || val
          )
        : [];
      const shortGoals = businessData.short_term_goals
        ? businessData.short_term_goals.map((val: string) =>
            shortTermGoalsMap[val] || val
          )
        : [];
      const mediumGoals = businessData.medium_term_goals
        ? businessData.medium_term_goals.map((val: string) =>
            mediumTermGoalsMap[val] || val
          )
        : [];
      const kpis = businessData.important_kpis
        ? businessData.important_kpis.map((val: string) =>
            kpiMap[val] || val
          )
        : [];
      return (
        <div className="grid grid-cols-1 gap-2 text-sm">
          <p><strong>Modelo de negócio:</strong> {businessModel || "Não informado"}</p>
          <p><strong>Desafios:</strong> {challenges.length > 0 ? challenges.join(", ") : "Não informados"}</p>
          <p><strong>Objetivos de curto prazo:</strong> {shortGoals.length > 0 ? shortGoals.join(", ") : "Não informados"}</p>
          <p><strong>Objetivos de médio prazo:</strong> {mediumGoals.length > 0 ? mediumGoals.join(", ") : "Não informados"}</p>
          <p><strong>KPIs importantes:</strong> {kpis.length > 0 ? kpis.join(", ") : "Não informados"}</p>
        </div>
      );
    case "ai_experience":
      const aiExp = data || {};
      return (
        <div className="grid grid-cols-1 gap-2 text-sm">
          <p><strong>Nível de conhecimento:</strong> {aiExp.knowledge_level && knowledgeLevelMap[aiExp.knowledge_level] || aiExp.knowledge_level || "Não informado"}</p>
          <p><strong>Ferramentas utilizadas:</strong> {aiExp.previous_tools?.join(", ") || "Nenhuma"}</p>
          <p><strong>Já implementou soluções de IA:</strong> {aiExp.has_implemented === "sim" ? "Sim" : "Não"}</p>
          <p><strong>Áreas de interesse em IA:</strong> {
            aiExp.desired_ai_areas?.length
              ? aiExp.desired_ai_areas.map((area: string) => aiAreasMap[area] || area).join(", ")
              : aiExp.desired_ai_area
                ? aiAreasMap[aiExp.desired_ai_area] || aiExp.desired_ai_area
                : "Nenhuma"
          }</p>
          <p><strong>Completou formação VIVER DE IA:</strong> {aiExp.completed_formation ? "Sim" : "Não"}</p>
          <p><strong>NPS (Se já foi membro):</strong> {typeof aiExp.nps_score === "number" ? aiExp.nps_score : "Não informado"}</p>
          {aiExp.improvement_suggestions && <p><strong>Sugestões de melhoria:</strong> {aiExp.improvement_suggestions}</p>}
        </div>
      );
    case "business_goals":
      const goals = data || {};
      return (
        <div className="grid grid-cols-1 gap-2 text-sm">
          <p><strong>Objetivo primário:</strong> {goals.primary_goal && motivosMap[goals.primary_goal] || goals.primary_goal || "Não informado"}</p>
          <p><strong>Resultados esperados:</strong> {goals.expected_outcomes?.join(", ") || "Não informados"}</p>
          <p><strong>Resultado esperado em 30 dias:</strong> {goals.expected_outcome_30days || (goals.expected_outcomes && goals.expected_outcomes[0]) || "Não informado"}</p>
          <p><strong>Tipo de solução prioritária:</strong> {goals.priority_solution_type || "Não informado"}</p>
          <p><strong>Como implementar:</strong> {goals.how_implement && implementMap[goals.how_implement] || goals.how_implement || "Não informado"}</p>
          <p><strong>Disponibilidade semanal:</strong> {goals.week_availability || "Não informado"}</p>
          <p><strong>Interesse em eventos ao vivo:</strong> {typeof goals.live_interest === "number" ? `${goals.live_interest}/10` : "Não informado"}</p>
          <p><strong>Formatos de conteúdo preferidos:</strong> {goals.content_formats && goals.content_formats.length > 0 ? goals.content_formats.map((f: string) => formatoMap[f] || f).join(", ") : "Não informados"}</p>
        </div>
      );
    case "experience_personalization":
      const exp = data || {};
      return (
        <div className="grid grid-cols-1 gap-2 text-sm">
          <p><strong>Interesses:</strong> {exp.interests && exp.interests.length ? exp.interests.map((i: string) => interestsMap[i] || i).join(", ") : "Não informados"}</p>
          <p><strong>Preferência de horário:</strong> {exp.time_preference && exp.time_preference.length ? exp.time_preference.map((p: string) => timePreferenceMap[p] || p).join(", ") : "Não informada"}</p>
          <p><strong>Dias disponíveis:</strong> {exp.available_days?.join(", ") || "Não informados"}</p>
          <p><strong>Disponibilidade para networking:</strong> {typeof exp.networking_availability === "number" ? `${exp.networking_availability} hora(s) por semana` : "Não informada"}</p>
          <p><strong>Habilidades para compartilhar:</strong> {exp.skills_to_share && exp.skills_to_share.length ? exp.skills_to_share.map((s: string) => skillsMap[s] || s).join(", ") : "Não informadas"}</p>
          <p><strong>Tópicos para mentoria:</strong> {exp.mentorship_topics && exp.mentorship_topics.length ? exp.mentorship_topics.map((t: string) => mentorshipMap[t] || t).join(", ") : "Não informados"}</p>
        </div>
      );
    case "complementary_info":
      const sourceMap: {[key: string]: string} = {
        instagram: "Instagram",
        youtube: "YouTube",
        facebook: "Facebook",
        linkedin: "LinkedIn",
        google: "Google",
        indicacao: "Indicação",
        evento: "Evento",
        newsletter: "Newsletter",
        podcast: "Podcast",
        formacao: "Formação VIVER DE IA"
      };
      return (
        <div className="grid grid-cols-1 gap-2 text-sm">
          <p><strong>Como conheceu:</strong> {data.how_found_us ? (sourceMap[data.how_found_us] || data.how_found_us) : "Não informado"}</p>
          {data.referred_by && <p><strong>Indicado por:</strong> {data.referred_by}</p>}
          <p><strong>Autoriza uso de cases:</strong> {data.authorize_case_usage ? "Sim" : "Não"}</p>
          <p><strong>Interesse em entrevista:</strong> {data.interested_in_interview ? "Sim" : "Não"}</p>
          <p><strong>Tópicos prioritários:</strong> {data.priority_topics && data.priority_topics.length > 0 ? data.priority_topics.map((t: string) => topicsMap[t] || t).join(", ") : "Não informados"}</p>
        </div>
      );
    default:
      return "Informações não disponíveis";
  }
}
