
import React from "react";
import { Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

interface AISuggestionsFieldProps {
  control: any;
}

export const AISuggestionsField: React.FC<AISuggestionsFieldProps> = ({ control }) => (
  <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
    <h3 className="text-lg font-medium text-gray-800">Na sua opinião, o que tornaria o VIVER DE IA Club ainda melhor?</h3>
    <Controller
      control={control}
      name="improvement_suggestions"
      render={({ field }) => (
        <Textarea
          placeholder="Compartilhe suas sugestões e ideias para melhorarmos sua experiência..."
          className="min-h-[120px]"
          {...field}
        />
      )}
    />
  </div>
);
