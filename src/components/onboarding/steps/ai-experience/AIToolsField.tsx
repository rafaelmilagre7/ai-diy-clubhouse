
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
  <div className="space-y-4 bg-[#151823] p-6 rounded-lg border border-neutral-700">
    <h3 className="text-lg font-medium text-white">Ferramentas de IA que já utilizou</h3>
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
                  className="border-neutral-600 data-[state=checked]:text-white"
                />
                <span className="text-sm text-neutral-300">{tool}</span>
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
