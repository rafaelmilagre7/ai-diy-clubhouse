
import React from "react";
import { Controller } from "react-hook-form";
import { Slider } from "@/components/ui/slider";

interface AINPSFieldProps {
  control: any;
}

export const AINPSField: React.FC<AINPSFieldProps> = ({ control }) => (
  <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
    <h3 className="text-lg font-medium text-gray-800">Numa escala de 0 a 10, qual a probabilidade de você recomendar o VIVER DE IA Club para um amigo ou colega?</h3>
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
            <span className="text-sm text-gray-500">0 - Pouco provável</span>
            <span className="text-lg font-medium">{field.value}</span>
            <span className="text-sm text-gray-500">10 - Extremamente provável</span>
          </div>
        </div>
      )}
    />
  </div>
);
