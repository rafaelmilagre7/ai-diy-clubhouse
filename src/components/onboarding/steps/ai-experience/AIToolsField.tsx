
import React, { memo } from "react";
import { Controller, FieldError } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

interface AIToolsFieldProps {
  control: any;
  error?: FieldError | FieldError[] | any;
}

const toolsOptions = [
  "ChatGPT", "Gemini (Google)", "Midjourney", "Typebot", "Make.com",
  "Zapier", "Claude", "Microsoft Copilot", "OpenAI API",
  "ManyChat", "N8N", "NicoChat",
];

const AIToolsFieldComponent: React.FC<AIToolsFieldProps> = ({ control, error }) => (
  <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
    <h3 className="text-lg font-medium text-gray-800">Ferramentas de IA que já utilizou</h3>
    <Controller
      control={control}
      name="previous_tools"
      rules={{ validate: (value) => (Array.isArray(value) && value.length > 0) || "Selecione pelo menos uma opção" }}
      render={({ field, fieldState }) => (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {toolsOptions.map((tool) => (
              <label key={tool} className="flex items-center gap-2">
                <Checkbox
                  checked={Array.isArray(field.value) && field.value.includes(tool)}
                  onCheckedChange={(checked) => {
                    const currentValue = Array.isArray(field.value) ? field.value : [];
                    if (checked) {
                      field.onChange([...currentValue, tool]);
                    } else {
                      field.onChange(currentValue.filter((t: string) => t !== tool));
                    }
                  }}
                  id={`tool-${tool}`}
                />
                <span className="text-sm">{tool}</span>
              </label>
            ))}
          </div>
          {(fieldState.error || error) && (
            <span className="text-red-500 text-xs">
              {fieldState.error?.message || 
              (typeof error === 'object' && 'message' in error ? error.message : 'Erro de validação')}
            </span>
          )}
        </div>
      )}
    />
  </div>
);

export const AIToolsField = memo(AIToolsFieldComponent);
