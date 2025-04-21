
import React from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { NavigationButtons } from "./NavigationButtons";
import { useNavigate } from "react-router-dom";
import { OnboardingStepProps } from "@/types/onboarding";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight } from "lucide-react";

const discoverOptions = [
  { value: "google", label: "Google" },
  { value: "social_media", label: "Redes Sociais" },
  { value: "recommendation", label: "Recomendação" },
  { value: "event", label: "Evento" },
  { value: "ads", label: "Anúncio" },
  { value: "partner", label: "Parceiro" },
  { value: "other", label: "Outro" }
];

const topicOptions = [
  { value: "ia_gerativa", label: "IA Gerativa (GPT/Claude/etc)" },
  { value: "assistentes_ia", label: "Assistentes de IA Personalizados" },
  { value: "automacao", label: "Automação de Processos" },
  { value: "computer_vision", label: "Visão Computacional" },
  { value: "dados", label: "Análise de Dados" },
  { value: "seo", label: "SEO e Marketing Digital" },
  { value: "atendimento", label: "Atendimento ao Cliente" },
  { value: "vendas", label: "Vendas e Prospecção" },
  { value: "rh", label: "RH e Recrutamento" },
  { value: "financeiro", label: "Controle Financeiro" },
  { value: "produto", label: "Desenvolvimento de Produto" },
];

export const ComplementaryInfoStep = ({ 
  onSubmit, 
  isSubmitting, 
  initialData 
}: OnboardingStepProps) => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm({
    defaultValues: {
      how_found_us: initialData?.how_found_us || "",
      referred_by: initialData?.referred_by || "",
      authorize_case_usage: initialData?.authorize_case_usage || false,
      interested_in_interview: initialData?.interested_in_interview || false,
      priority_topics: initialData?.priority_topics || [],
    }
  });

  const handlePrevious = () => {
    navigate('/onboarding/customization');
  };

  const handleFormSubmit = (data: any) => {
    onSubmit('complementary_info', {
      complementary_info: data
    });
  };

  const sourceType = watch("how_found_us");

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="how_found_us">Como você conheceu o VIVER DE IA Club?</Label>
            <Select
              defaultValue={initialData?.how_found_us || ""}
              onValueChange={(value) => setValue("how_found_us", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                {discoverOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sourceType === "recommendation" && (
            <div>
              <Label htmlFor="referred_by">Quem indicou você?</Label>
              <Input
                id="referred_by"
                placeholder="Nome da pessoa que indicou você"
                {...register("referred_by")}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Label>Tópicos Prioritários para Você</Label>
          <p className="text-sm text-gray-400">Selecione até 5 tópicos que são mais importantes para você</p>
          <MultiSelect
            options={topicOptions}
            defaultValue={initialData?.priority_topics || []}
            onChange={(selected) => {
              setValue("priority_topics", selected);
            }}
            className="bg-gray-700"
            placeholder="Selecione os tópicos"
            maxItems={5}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="authorize_case_usage"
              checked={watch("authorize_case_usage")}
              onCheckedChange={(checked) => setValue("authorize_case_usage", checked as boolean)}
              className="mt-0.5 data-[state=checked]:bg-[#0ABAB5] data-[state=checked]:border-[#0ABAB5]"
            />
            <div className="space-y-1">
              <Label htmlFor="authorize_case_usage" className="font-normal">Autorizo o uso do meu caso como exemplo de sucesso</Label>
              <p className="text-sm text-gray-400">
                Permite que compartilhemos resultados obtidos com sua implementação (sem dados sensíveis ou confidenciais).
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="interested_in_interview"
              checked={watch("interested_in_interview")}
              onCheckedChange={(checked) => setValue("interested_in_interview", checked as boolean)}
              className="mt-0.5 data-[state=checked]:bg-[#0ABAB5] data-[state=checked]:border-[#0ABAB5]"
            />
            <div className="space-y-1">
              <Label htmlFor="interested_in_interview" className="font-normal">Tenho interesse em participar de entrevistas e cases</Label>
              <p className="text-sm text-gray-400">
                Podemos entrar em contato para entrevistas e compartilhamento de experiência.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isSubmitting}
        >
          Voltar
        </Button>
        <Button
          type="submit"
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Processando..."
          ) : (
            <span className="flex items-center gap-2">
              Finalizar Onboarding
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};
