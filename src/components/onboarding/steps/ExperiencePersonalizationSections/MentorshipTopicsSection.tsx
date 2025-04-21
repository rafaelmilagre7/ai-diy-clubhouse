
import React from "react";
import { cn } from "@/lib/utils";
import { UseFormWatch } from "react-hook-form";

interface MentorshipTopicsSectionProps {
  watch: UseFormWatch<any>;
  toggleSelect: (field: "mentorship_topics", value: string) => void;
  errors: Record<string, any>;
}

const MENTORSHIP_OPTIONS = [
  { label: "Implementação prática de IA no negócio", value: "implementacao_pratica" },
  { label: "Engenharia de prompts avançada", value: "engenharia_prompts_avancada" },
  { label: "Automação de processos com no-code", value: "automacao_no_code" },
  { label: "Escalabilidade de soluções de IA", value: "escalabilidade_ia" },
  { label: "Marketing e geração de leads com IA", value: "marketing_leads" },
  { label: "Monetização de soluções de IA", value: "monetizacao_ia" },
  { label: "Criação de assistentes personalizados", value: "assistentes_personalizados" },
  { label: "Integração de múltiplas ferramentas de IA", value: "integracao_multi_ferramentas_ia" },
  { label: "Vendas e prospecção com IA", value: "vendas_prospeccao_ia" },
  { label: "Criação de conteúdo estratégico com IA", value: "conteudo_estrategico_ia" },
];

export function MentorshipTopicsSection({ watch, toggleSelect, errors }: MentorshipTopicsSectionProps) {
  return (
    <div>
      <label className="font-semibold text-gray-700 mb-2 block">
        Tópicos em que Você Gostaria de Receber Mentoria <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap gap-3">
        {MENTORSHIP_OPTIONS.map(opt => (
          <button key={opt.value}
            type="button"
            className={cn(
              "px-3 py-2 rounded-lg border transition-all text-sm",
              (watch("mentorship_topics") || []).includes(opt.value)
                ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                : "bg-white text-gray-700 border-gray-200"
            )}
            onClick={() => toggleSelect("mentorship_topics", opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {errors.mentorship_topics && <span className="text-xs text-red-500">Escolha pelo menos um tópico.</span>}
    </div>
  );
}
