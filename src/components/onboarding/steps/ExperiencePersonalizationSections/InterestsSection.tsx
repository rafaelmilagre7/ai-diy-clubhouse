
import React from "react";
import { cn } from "@/lib/utils";
import { UseFormWatch } from "react-hook-form";
import { ExperienceFormData } from "./useExperiencePersonalizationForm";

interface InterestsSectionProps {
  watch: UseFormWatch<ExperienceFormData>;
  toggleSelect: (field: "interests", value: string) => void;
  errors: Record<string, any>;
  showErrors?: boolean;
}

const INTERESTS_OPTIONS = [
  { value: "ia_generativa", label: "IA Generativa (GPT, Gemini, Claude)" },
  { value: "automacao", label: "Automação de Processos" },
  { value: "chatbots", label: "Chatbots e Assistentes Virtuais" },
  { value: "voice_ia", label: "IA de Voz e Reconhecimento de Fala" },
  { value: "analise_ia", label: "Análise de dados com IA" },
];

export function InterestsSection({ watch, toggleSelect, errors, showErrors = false }: InterestsSectionProps) {
  const selectedInterests = watch("interests") || [];
  const hasError = errors.interests && showErrors;

  return (
    <div>
      <label className={cn(
        "font-semibold mb-2 block",
        hasError ? "text-red-500" : "text-white"
      )}>
        Interesses Específicos em IA <span className="text-red-500">*</span>
      </label>
      <div className={cn(
        "flex flex-wrap gap-3",
        hasError ? "border-red-500 border p-3 rounded-md" : ""
      )}>
        {INTERESTS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={cn(
              "px-3 py-2 rounded-lg border transition-all text-sm",
              selectedInterests.includes(opt.value)
                ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                : "bg-[#1A1E2E] text-neutral-300 border-neutral-700"
            )}
            onClick={() => toggleSelect("interests", opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {hasError && (
        <span className="text-xs text-red-500 mt-1 block">
          Selecione pelo menos um interesse.
        </span>
      )}
    </div>
  );
}
