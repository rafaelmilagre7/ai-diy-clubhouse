
import React from "react";
import { Controller, Control } from "react-hook-form";
import { Slider } from "@/components/ui/slider";

interface NetworkingAvailabilitySectionProps {
  control: Control<any>;
  errors: Record<string, any>;
}

export function NetworkingAvailabilitySection({ control, errors }: NetworkingAvailabilitySectionProps) {
  return (
    <div>
      <label className="font-semibold text-gray-700 mb-2 block">
        Disponibilidade para Networking <span className="text-red-500">*</span>
      </label>
      <Controller
        name="networking_availability"
        control={control}
        rules={{ required: true, min: 0, max: 10 }}
        render={({ field }) => (
          <div className="flex flex-col gap-2">
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
      {errors.networking_availability && <span className="text-xs text-red-500">Informe disponibilidade.</span>}
    </div>
  );
}
