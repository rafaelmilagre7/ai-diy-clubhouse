
import React from "react";
import { Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

interface AISuggestionsFieldProps {
  control: any;
}

export const AISuggestionsField: React.FC<AISuggestionsFieldProps> = ({ control }) => (
  <div className="space-y-4 bg-[#151823] p-6 rounded-lg border border-neutral-700">
    <h3 className="text-lg font-medium text-white">
      Sugestões para melhorar o Club
    </h3>
    <Controller
      control={control}
      name="improvement_suggestions"
      render={({ field }) => (
        <div className="space-y-2">
          <Textarea
            {...field}
            placeholder="Compartilhe suas ideias para melhorar a experiência no Viver de IA Club..."
            className="min-h-32 bg-[#1A1E2E] border-neutral-700 text-white placeholder:text-neutral-500"
          />
          <p className="text-xs text-neutral-400">
            Suas sugestões são muito importantes para continuarmos melhorando.
          </p>
        </div>
      )}
    />
  </div>
);
