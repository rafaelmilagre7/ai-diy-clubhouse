
import React from "react";
import { Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

interface AIPreviousAttemptsFieldProps {
  control: any;
}

export const AIPreviousAttemptsField: React.FC<AIPreviousAttemptsFieldProps> = ({ control }) => (
  <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
    <h3 className="text-lg font-medium text-gray-800">Tentativas anteriores de implementação de IA</h3>
    <Controller
      control={control}
      name="previous_attempts"
      render={({ field }) => (
        <Textarea
          placeholder="Descreva brevemente suas experiências anteriores com implementação de IA..."
          className="min-h-[100px]"
          {...field}
        />
      )}
    />
  </div>
);
