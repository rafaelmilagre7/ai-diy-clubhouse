
import React from "react";
import { Controller, Control, UseFormWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import { ExperienceFormData } from "./useExperiencePersonalizationForm";

interface TimePreferenceSectionProps {
  control: Control<ExperienceFormData>;
  watch: UseFormWatch<ExperienceFormData>;
  toggleSelect: (field: "time_preference", value: string) => void;
  errors: Record<string, any>;
  showErrors?: boolean;
}

const TIME_OPTIONS = [
  { value: "manha", label: "Manhã (8h–12h)", icon: "sun", emoji: "☀️" },
  { value: "tarde", label: "Tarde (13h–18h)", icon: "cloud-sun", emoji: "🌤️" },
  { value: "noite", label: "Noite (19h–22h)", icon: "moon", emoji: "🌙" },
];

export function TimePreferenceSection({ control, watch, toggleSelect, errors, showErrors = false }: TimePreferenceSectionProps) {
  const selectedTimes = watch("time_preference") || [];
  const hasError = errors.time_preference && showErrors;

  return (
    <div>
      <label className={cn(
        "font-semibold mb-2 block",
        hasError ? "text-red-500" : "text-white"
      )}>
        Preferência de Horários para Encontros Online <span className="text-red-500">*</span>
      </label>
      <Controller
        name="time_preference"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <div className={cn(
            "flex gap-4",
            hasError ? "border-red-500 border p-3 rounded-md" : ""
          )}>
            {TIME_OPTIONS.map(opt => (
              <button
                type="button"
                key={opt.value}
                className={cn(
                  "flex items-center border px-4 py-2 rounded-lg gap-2 transition-all flex-1",
                  selectedTimes.includes(opt.value)
                    ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                    : "bg-[#1A1E2E] text-neutral-300 border-neutral-700 hover:border-neutral-500"
                )}
                onClick={() => toggleSelect("time_preference", opt.value)}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      />
      {hasError && (
        <span className="text-xs text-red-500 mt-1 block">
          Selecione pelo menos um horário.
        </span>
      )}
    </div>
  );
}
