
import React from "react";
import { cn } from "@/lib/utils";
import { UseFormWatch } from "react-hook-form";
import { ExperienceFormData } from "./useExperiencePersonalizationForm";

interface AvailableDaysSectionProps {
  watch: UseFormWatch<ExperienceFormData>;
  toggleSelect: (field: "available_days", value: string) => void;
  errors: Record<string, any>;
}

const DAYS_OPTIONS = [
  "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo",
];

export function AvailableDaysSection({ watch, toggleSelect, errors }: AvailableDaysSectionProps) {
  return (
    <div>
      <label className="font-semibold text-gray-700 mb-2 block">
        Dias da Semana Disponíveis <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {DAYS_OPTIONS.map(day => (
          <button key={day}
            type="button"
            className={cn(
              "rounded-full px-4 py-1 border font-medium transition",
              (watch("available_days") || []).includes(day)
                ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                : "bg-white text-gray-700 border-gray-200"
            )}
            onClick={() => toggleSelect("available_days", day)}
          >
            {day}
          </button>
        ))}
      </div>
      {errors.available_days && <span className="text-xs text-red-500">Selecione pelo menos um dia.</span>}
    </div>
  );
}
