
import React from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { ArrowRight } from "lucide-react";

const discoverOptions = [
  { value: "google", label: "Google" },
  { value: "social_media", label: "Redes Sociais" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "recommendation", label: "Recomendação" },
  { value: "event", label: "Evento" },
  { value: "podcast", label: "Podcast" },
  { value: "webinar", label: "Webinar" },
  { value: "news", label: "Notícia/Blog" },
  { value: "ads", label: "Anúncio" },
  { value: "partner", label: "Parceiro" },
  { value: "tiktok", label: "TikTok" },
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
  { value: "suporte", label: "Suporte ao Cliente" },
  { value: "marketing", label: "Marketing Digital" },
  { value: "operacoes", label: "Operações" },
  { value: "estrategia", label: "Estratégia de Negócios" }
];

export const ComplementaryInfoStep = ({ 
  onSubmit, 
  isSubmitting, 
  initialData 
}: OnboardingStepProps) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      how_found_us: initialData?.how_found_us || "",
      referred_by: initialData?.referred_by || "",
      authorize_case_usage: initialData?.authorize_case_usage || false,
      interested_in_interview: initialData?.interested_in_interview || false,
      priority_topics: initialData?.priority_topics || [],
    }
  });

  const handleFormSubmit = (data: any) => {
    onSubmit('complementary_info', {
      complementary_info: data
    });
  };

  const sourceType = watch("how_found_us");

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="space-y-6">
        {/* Como conheceu seção */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
          <Label htmlFor="how_found_us" className="text-lg font-semibold">
            Como você conheceu o VIVER DE IA Club?
          </Label>
          <Select
            defaultValue={initialData?.how_found_us || ""}
            onValueChange={(value) => setValue("how_found_us", value)}
          >
            <SelectTrigger className="w-full bg-gray-900 border-gray-700">
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

          {sourceType === "recommendation" && (
            <div className="pt-2">
              <Label htmlFor="referred_by">Quem indicou você?</Label>
              <Input
                id="referred_by"
                placeholder="Nome da pessoa que indicou você"
                className="bg-gray-900 border-gray-700 mt-1"
                {...register("referred_by")}
              />
            </div>
          )}
        </div>

        {/* Tópicos Prioritários seção */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Tópicos Prioritários para Você</Label>
            <p className="text-sm text-gray-400">
              Selecione até 5 tópicos que são mais importantes para o seu negócio. 
              Isso nos ajudará a personalizar sua experiência.
            </p>
          </div>
          <MultiSelect
            options={topicOptions}
            defaultValue={initialData?.priority_topics || []}
            onChange={(selected) => setValue("priority_topics", selected)}
            className="bg-gray-900"
            placeholder="Selecione os tópicos"
            maxItems={5}
          />
        </div>

        {/* Autorizações seção */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
          <h3 className="text-lg font-semibold mb-4">Permissões e Interesses</h3>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="authorize_case_usage"
                checked={watch("authorize_case_usage")}
                onCheckedChange={(checked) => setValue("authorize_case_usage", checked as boolean)}
                className="mt-1 data-[state=checked]:bg-[#0ABAB5] data-[state=checked]:border-[#0ABAB5]"
              />
              <div className="space-y-1">
                <Label htmlFor="authorize_case_usage" className="font-normal">
                  Autorizo o uso do meu caso como exemplo de sucesso
                </Label>
                <p className="text-sm text-gray-400">
                  Permite que compartilhemos resultados obtidos com sua implementação 
                  (sem dados sensíveis ou confidenciais).
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="interested_in_interview"
                checked={watch("interested_in_interview")}
                onCheckedChange={(checked) => setValue("interested_in_interview", checked as boolean)}
                className="mt-1 data-[state=checked]:bg-[#0ABAB5] data-[state=checked]:border-[#0ABAB5]"
              />
              <div className="space-y-1">
                <Label htmlFor="interested_in_interview" className="font-normal">
                  Tenho interesse em participar de entrevistas e cases
                </Label>
                <p className="text-sm text-gray-400">
                  Podemos entrar em contato para entrevistas e compartilhamento de experiência.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de navegação */}
      <div className="flex justify-between pt-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
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
