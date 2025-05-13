
import React from "react";
import { cn } from "@/lib/utils";
import { UseFormWatch } from "react-hook-form";
import { ExperienceFormData } from "./useExperiencePersonalizationForm";

interface SkillsToShareSectionProps {
  watch: UseFormWatch<ExperienceFormData>;
  toggleSelect: (field: "skills_to_share", value: string) => void;
  errors: Record<string, any>;
  showErrors?: boolean;
}

const SKILLS_OPTIONS = [
  { label: "Engenharia de prompts", value: "engenharia_prompts" },
  { label: "Integração de APIs de IA", value: "integracao_apis" },
  { label: "Vendas potencializadas por IA", value: "vendas_ia" },
  { label: "Criação de conteúdo com IA", value: "criacao_conteudo" },
  { label: "Gestão de projetos de tecnologia", value: "gestao_projetos" },
  { label: "Desenvolvimento de chatbots", value: "desenvolvimento_chatbots" },
  { label: "Marketing digital com IA", value: "marketing_digital" },
  { label: "Automação de processos (no-code)", value: "automacao_no_code" },
  { label: "Desenvolvimento de produtos digitais", value: "desenvolvimento_produtos_digitais" },
  { label: "Análise de dados e Business Intelligence", value: "analise_dados_bi" },
];

export function SkillsToShareSection({ watch, toggleSelect, errors, showErrors = false }: SkillsToShareSectionProps) {
  const selectedSkills = watch("skills_to_share") || [];
  const hasError = errors.skills_to_share && showErrors;

  return (
    <div>
      <label className={cn(
        "font-semibold mb-2 block",
        hasError ? "text-red-500" : "text-white"
      )}>
        Habilidades que Você Pode Compartilhar com a Comunidade <span className="text-red-500">*</span>
      </label>
      <div className={cn(
        "flex flex-wrap gap-3",
        hasError ? "border-red-500 border p-3 rounded-md" : ""
      )}>
        {SKILLS_OPTIONS.map(opt => (
          <button key={opt.value}
            type="button"
            className={cn(
              "px-3 py-2 rounded-lg border transition-all text-sm",
              selectedSkills.includes(opt.value)
                ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                : "bg-[#1A1E2E] text-neutral-300 border-neutral-700"
            )}
            onClick={() => toggleSelect("skills_to_share", opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {hasError && (
        <span className="text-xs text-red-500 mt-1 block">
          Escolha pelo menos uma habilidade.
        </span>
      )}
    </div>
  );
}
