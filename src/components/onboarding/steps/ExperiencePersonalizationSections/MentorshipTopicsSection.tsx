
import React from "react";
import { cn } from "@/lib/utils";
import { UseFormWatch } from "react-hook-form";
import { ExperienceFormData } from "./useExperiencePersonalizationForm";

interface MentorshipTopicsSectionProps {
  watch: UseFormWatch<ExperienceFormData>;
  toggleSelect: (field: "mentorship_topics", value: string) => void;
  errors: Record<string, any>;
  showErrors?: boolean;
}

const TOPICS = [
  { value: "implementacao_pratica", label: "Implementação prática de IA no negócio" },
  { value: "engenharia_prompts", label: "Engenharia de prompts avançada" },
  { value: "automacao_processos", label: "Automação de processos com no-code" },
  { value: "escalabilidade", label: "Escalabilidade de soluções de IA" },
  { value: "marketing_geracao", label: "Marketing e geração de leads com IA" },
  { value: "monetizacao", label: "Monetização de soluções de IA" },
  { value: "criacao_assistentes", label: "Criação de assistentes personalizados" },
  { value: "integracao_ferramentas", label: "Integração de múltiplas ferramentas de IA" },
  { value: "vendas_prospeccao", label: "Vendas e prospecção com IA" },
  { value: "conteudo_estrategico", label: "Criação de conteúdo estratégico com IA" }
];

export function MentorshipTopicsSection({ watch, toggleSelect, errors, showErrors = false }: MentorshipTopicsSectionProps) {
  const selectedTopics = watch("mentorship_topics") || [];
  const hasError = errors.mentorship_topics && showErrors;

  return (
    <div>
      <label className={cn(
        "font-semibold mb-2 block",
        hasError ? "text-red-500" : "text-white"
      )}>
        Tópicos em que Você Gostaria de Receber Mentoria <span className="text-red-500">*</span>
      </label>
      <div className={cn(
        "flex flex-wrap gap-3",
        hasError ? "border-red-500 border p-3 rounded-md" : ""
      )}>
        {TOPICS.map(topic => (
          <button key={topic.value}
            type="button"
            className={cn(
              "px-3 py-2 rounded-lg border transition-all text-sm",
              selectedTopics.includes(topic.value)
                ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                : "bg-[#1A1E2E] text-neutral-300 border-neutral-700"
            )}
            onClick={() => toggleSelect("mentorship_topics", topic.value)}
          >
            {topic.label}
          </button>
        ))}
      </div>
      {hasError && (
        <span className="text-xs text-red-500 mt-1 block">
          Escolha pelo menos um tópico.
        </span>
      )}
    </div>
  );
}
