
import React from "react";
import { cn } from "@/lib/utils";
import { UseFormWatch } from "react-hook-form";
import { ExperienceFormData } from "./useExperiencePersonalizationForm";

interface AvailableDaysSectionProps {
  watch: UseFormWatch<ExperienceFormData>;
  toggleSelect: (field: "available_days", value: string) => void;
  errors: Record<string, any>;
  showErrors?: boolean;
}

const DAYS_OPTIONS = [
  "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo",
];

export function AvailableDaysSection({ watch, toggleSelect, errors, showErrors = false }: AvailableDaysSectionProps) {
  const selectedDays = watch("available_days") || [];
  const hasError = errors.available_days && showErrors;

  return (
    <div>
      <label className={cn(
        "font-semibold mb-2 block",
        hasError ? "text-red-500" : "text-gray-700"
      )}>
        Dias da Semana Disponíveis <span className="text-red-500">*</span>
      </label>
      <div className={cn(
        "flex flex-wrap gap-2",
        hasError ? "border-red-500 border p-3 rounded-md" : ""
      )}>
        {DAYS_OPTIONS.map(day => (
          <button key={day}
            type="button"
            className={cn(
              "rounded-full px-4 py-1 border font-medium transition",
              selectedDays.includes(day)
                ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                : "bg-white text-gray-700 border-gray-200"
            )}
            onClick={() => toggleSelect("available_days", day)}
          >
            {day}
          </button>
        ))}
      </div>
      {hasError && (
        <span className="text-xs text-red-500 mt-1 block">
          Selecione pelo menos um dia.
        </span>
      )}
    </div>
  );
}
