
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
        hasError ? "text-red-500" : "text-gray-700"
      )}>
        Disponibilidade para Networking <span className="text-red-500">*</span>
      </label>
      <Controller
        name="networking_availability"
        control={control}
        rules={{ required: true, min: 0, max: 10 }}
        render={({ field }) => (
          <div className={cn(
            "flex flex-col gap-2",
            hasError ? "border-red-500 border p-3 rounded-md" : ""
          )}>
            <Slider
              min={0}
              max={10}
              step={1}
              value={[field.value]}
              onValueChange={val => field.onChange(val[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs">
              <span>Pouca disponibilidade</span>
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
