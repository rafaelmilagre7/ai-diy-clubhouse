
import React from "react";
import { Controller } from "react-hook-form";
import { Slider } from "@/components/ui/slider";

interface AINPSFieldProps {
  control: any;
}

export const AINPSField: React.FC<AINPSFieldProps> = ({ control }) => (
  <div className="space-y-4 bg-[#151823] p-6 rounded-lg border border-neutral-700">
    <h3 className="text-lg font-medium text-white">
      Avalie o Viver de IA Club de 0 a 10
    </h3>
    <Controller
      control={control}
      name="nps_score"
      rules={{ required: "Este campo é obrigatório" }}
      render={({ field }) => (
        <div className="space-y-6">
          <Slider
            value={[field.value]}
            min={0}
            max={10}
            step={1}
            onValueChange={(values) => field.onChange(values[0])}
            className="w-full"
          />
          <div className="flex justify-between">
            <span className="text-sm text-neutral-400">0 - Péssimo</span>
            <span className="text-lg font-medium text-viverblue">{field.value}</span>
            <span className="text-sm text-neutral-400">10 - Excelente</span>
          </div>
        </div>
      )}
    />
  </div>
);
