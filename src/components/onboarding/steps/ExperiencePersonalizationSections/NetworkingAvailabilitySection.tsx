
import React from "react";
import { Controller, Control } from "react-hook-form";
import { Slider } from "@/components/ui/slider";
import { ExperienceFormData } from "./useExperiencePersonalizationForm";
import { cn } from "@/lib/utils";

interface NetworkingAvailabilitySectionProps {
  control: Control<ExperienceFormData>;
  errors: Record<string, any>;
  showErrors?: boolean;
}

export function NetworkingAvailabilitySection({ control, errors, showErrors = false }: NetworkingAvailabilitySectionProps) {
  const hasError = errors.networking_availability && showErrors;

  return (
    <div>
      <label className={cn(
        "font-semibold mb-2 block",
        hasError ? "text-red-500" : "text-white"
      )}>
        Disponibilidade para Networking <span className="text-red-500">*</span>
      </label>
      <Controller
        name="networking_availability"
        control={control}
        rules={{ required: true, min: 0, max: 10 }}
        render={({ field }) => (
          <div className={cn(
            "flex flex-col gap-2 bg-[#1A1E2E] p-4 rounded-lg border border-neutral-700",
            hasError ? "border-red-500" : ""
          )}>
            <Slider
              min={0}
              max={10}
              step={1}
              value={[field.value || 0]}
              onValueChange={val => field.onChange(val[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Pouca disponibilidade</span>
              <span className="text-[#0ABAB5] text-lg font-medium">{field.value || 0}</span>
              <span>Muita disponibilidade</span>
            </div>
          </div>
        )}
      />
      {hasError && (
        <span className="text-xs text-red-500 mt-1 block">
          Informe sua disponibilidade.
        </span>
      )}
    </div>
  );
}
