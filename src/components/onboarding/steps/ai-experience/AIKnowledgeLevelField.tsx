
import React from "react";
import { Controller, FieldError } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface AIKnowledgeLevelFieldProps {
  control: any;
  error?: FieldError;
}

const knowledgeLevelOptions = [
  { value: "iniciante", label: "Iniciante – Estou começando agora" },
  { value: "basico", label: "Básico – Já experimentei algumas ferramentas" },
  { value: "intermediario", label: "Intermediário – Uso regularmente" },
  { value: "avancado", label: "Avançado – Uso frequentemente e conheço bem" },
  { value: "especialista", label: "Especialista – Trabalho profissionalmente com IA" },
];

export const AIKnowledgeLevelField: React.FC<AIKnowledgeLevelFieldProps> = ({ control, error }) => (
  <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
    <h3 className="text-lg font-medium text-gray-800">Nível de conhecimento em IA</h3>
    <Controller
      control={control}
      name="knowledge_level"
      rules={{ required: "Campo obrigatório" }}
      render={({ field, fieldState }) => (
        <RadioGroup
          value={field.value}
          onValueChange={field.onChange}
          className="flex flex-col space-y-3"
        >
          {knowledgeLevelOptions.map((opt) => (
            <div key={opt.value} className="flex items-center gap-3">
              <RadioGroupItem value={opt.value} id={`knowledge-${opt.value}`} />
              <Label htmlFor={`knowledge-${opt.value}`} className="font-normal">
                {opt.label}
              </Label>
            </div>
          ))}
          {(fieldState.error || error) && (
            <span className="text-red-500 text-xs mt-1">
              {fieldState.error?.message || error?.message}
            </span>
          )}
        </RadioGroup>
      )}
    />
  </div>
);
