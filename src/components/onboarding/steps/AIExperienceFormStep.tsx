
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OnboardingData } from "@/types/onboarding";

interface AIExperienceFormStepProps {
  initialData?: OnboardingData["ai_experience"];
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep?: boolean;
  onComplete?: () => void;
}

const knowledgeOptions = [
  { value: "iniciante", label: "Sou iniciante/noção básica" },
  { value: "intermediario", label: "Já usei IA em algumas tarefas" },
  { value: "avancado", label: "Uso soluções avançadas de IA no negócio" },
];

const toolsOptions = [
  "ChatGPT",
  "Midjourney",
  "Copilot",
  "Bard/Gemini",
  "Claude",
  "Google AI",
  "Zapier/Make",
  "Nenhuma",
  "Outros",
];

const challengeOptions = [
  { value: "dificuldade_identificar", label: "Dificuldade em identificar onde aplicar IA" },
  { value: "falta_tempo", label: "Falta de tempo para implementar" },
  { value: "custo", label: "Custo das ferramentas/recursos" },
  { value: "tecnica", label: "Desafio técnico ou de integração" },
  { value: "resistencia", label: "Resistência da equipe ou cultura" },
  { value: "outros", label: "Outros" },
];

export const AIExperienceFormStep: React.FC<AIExperienceFormStepProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  isLastStep,
  onComplete,
}) => {
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      knowledge_level: initialData?.knowledge_level || "",
      previous_tools: initialData?.previous_tools || [],
      challenges: initialData?.challenges || [],
    },
  });

  const watchTools = watch("previous_tools");

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit("ai_exp", { ai_experience: data })
      )}
      className="space-y-8"
    >
      <div className="space-y-4">
        <div>
          <Label className="mb-2">Qual seu nível de conhecimento em IA?</Label>
          <Controller
            control={control}
            name="knowledge_level"
            rules={{ required: "Campo obrigatório" }}
            render={({ field, fieldState }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-col space-y-2"
              >
                {knowledgeOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-3">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <Label htmlFor={opt.value}>{opt.label}</Label>
                  </div>
                ))}
                {fieldState.error && (
                  <span className="text-red-500 text-xs mt-1">{fieldState.error.message}</span>
                )}
              </RadioGroup>
            )}
          />
        </div>

        <div>
          <Label className="mb-2">Quais ferramentas de IA você já usou?</Label>
          <Controller
            control={control}
            name="previous_tools"
            render={({ field }) => (
              <div className="flex flex-wrap gap-3">
                {toolsOptions.map((tool) => (
                  <label key={tool} className="flex items-center gap-2">
                    <Checkbox
                      checked={field.value?.includes(tool)}
                      onCheckedChange={() => {
                        if (field.value?.includes(tool)) {
                          field.onChange(field.value.filter((t: string) => t !== tool));
                        } else {
                          field.onChange([...(field.value || []), tool]);
                        }
                      }}
                      id={`tool-${tool}`}
                    />
                    <span>{tool}</span>
                  </label>
                ))}
              </div>
            )}
          />
        </div>

        {watchTools?.includes("Outros") && (
          <div>
            <Label htmlFor="outras-ferramentas">Quais outras?</Label>
            <Controller
              control={control}
              name="previous_tools"
              render={({ field }) => (
                <input
                  className="mt-1 border p-2 rounded w-full"
                  type="text"
                  placeholder="Descreva outras ferramentas que já utilizou"
                  onBlur={(e) => {
                    // Adiciona o valor digitado em 'Outros' à lista, evitando duplicidade
                    const outro = e.target.value.trim();
                    if (outro && !field.value?.includes(outro)) {
                      field.onChange([...(field.value.filter((t: string) => t !== "Outros")), outro]);
                    }
                  }}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>
        )}

        <div>
          <Label className="mb-2">Quais são seus principais desafios com IA?</Label>
          <Controller
            control={control}
            name="challenges"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                {challengeOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2">
                    <Checkbox
                      checked={field.value?.includes(opt.value)}
                      onCheckedChange={() => {
                        if (field.value?.includes(opt.value)) {
                          field.onChange(field.value.filter((v: string) => v !== opt.value));
                        } else {
                          field.onChange([...(field.value || []), opt.value]);
                        }
                      }}
                      id={opt.value}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Salvando..." : isLastStep ? "Finalizar" : "Continuar"}
      </Button>
    </form>
  );
};

