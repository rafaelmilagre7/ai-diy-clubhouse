
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { OnboardingData } from "@/types/onboarding";

interface AIExperienceFormStepProps {
  initialData?: OnboardingData["ai_experience"];
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep?: boolean;
  onComplete?: () => void;
}

const knowledgeLevelOptions = [
  { value: "iniciante", label: "Iniciante – Estou começando agora" },
  { value: "basico", label: "Básico – Já experimentei algumas ferramentas" },
  { value: "intermediario", label: "Intermediário – Uso regularmente" },
  { value: "avancado", label: "Avançado – Uso frequentemente e conheço bem" },
  { value: "especialista", label: "Especialista – Trabalho profissionalmente com IA" },
];

const toolsOptions = [
  "ChatGPT",
  "Gemini (Google)",
  "Midjourney",
  "Typebot",
  "Make.com",
  "Zapier",
  "Claude",
  "Microsoft Copilot",
  "OpenAI API",
  "ManyChat",
  "N8N",
  "NicoChat",
];

const implementedSolutionsOptions = [
  "Assistente de atendimento (chatbot)",
  "Automação de processos com IA",
  "Personalização de marketing com IA",
  "Transcrição e análise de reuniões",
  "Assistente de RH/Recrutamento",
  "Geração de conteúdo com IA",
  "Análise de dados com IA",
  "Assistente de vendas com IA",
  "Automação de criação de imagens/vídeos",
  "Nenhuma até o momento",
  "Outro",
];

const marketingSolutions = [
  "Criação de conteúdo",
  "SEO e otimização",
  "Otimização de anúncios",
  "Análise de concorrentes",
  "Gestão de redes sociais",
  "Email marketing",
  "Personalização de marketing",
];

const salesSolutions = [
  "Qualificação de leads",
  "Automação de CRM",
  "Previsão de vendas",
  "Chatbot de vendas",
  "Geração de propostas",
  "Análises de vendas",
];

const hrSolutions = [
  "Triagem de currículos",
  "Onboarding de funcionários",
  "Análise de desempenho",
  "Automação de entrevistas",
  "Chatbot de RH",
  "Matching de talentos",
];

const processSolutions = [
  "Processamento de documentos",
  "Extração de dados",
  "Priorização de tarefas",
  "Automação de fluxos de trabalho",
  "Automação de relatórios",
  "Otimização de processos",
];

const customerSolutions = [
  "Bot de atendimento ao cliente",
  "Análise de sentimento",
  "Análise de feedback",
  "Segmentação de clientes",
  "Mapeamento de jornada do cliente",
  "Recomendações personalizadas",
];

const generalSolutions = [
  "Chatbots e assistentes virtuais",
  "Análise de dados",
  "Automação de marketing",
  "Atendimento ao cliente",
  "Geração de imagens",
  "Geração de áudio",
  "Planejamento estratégico com IA",
  "Geração de conteúdo",
  "Automação de processos",
  "Automação de vendas",
  "Automação de RH",
  "Geração de vídeos",
  "Assistentes de voz",
  "Desenvolvimento de produtos com IA",
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
      implemented_solutions: initialData?.implemented_solutions || [],
      desired_solutions: initialData?.desired_solutions || [],
      previous_attempts: initialData?.previous_attempts || "",
      completed_formation: initialData?.completed_formation || false,
      is_member_for_month: initialData?.is_member_for_month || false,
      nps_score: initialData?.nps_score || 5,
      improvement_suggestions: initialData?.improvement_suggestions || "",
    },
  });

  const npsScore = watch("nps_score");

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit("ai_exp", { ai_experience: data })
      )}
      className="space-y-10"
    >
      {/* 1. Nível de conhecimento em IA */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800">Nível de conhecimento em IA</h3>
        <div>
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
                {fieldState.error && (
                  <span className="text-red-500 text-xs mt-1">
                    {fieldState.error.message}
                  </span>
                )}
              </RadioGroup>
            )}
          />
        </div>
      </div>

      {/* 2. Ferramentas de IA que já utilizou */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800">Ferramentas de IA que já utilizou</h3>
        <Controller
          control={control}
          name="previous_tools"
          rules={{ required: "Selecione pelo menos uma opção" }}
          render={({ field, fieldState }) => (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {toolsOptions.map((tool) => (
                <label key={tool} className="flex items-center gap-2">
                  <Checkbox
                    checked={field.value?.includes(tool)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([...(field.value || []), tool]);
                      } else {
                        field.onChange(
                          field.value?.filter((t: string) => t !== tool) || []
                        );
                      }
                    }}
                    id={`tool-${tool}`}
                  />
                  <span className="text-sm">{tool}</span>
                </label>
              ))}
              {fieldState.error && (
                <span className="text-red-500 text-xs col-span-full">
                  {fieldState.error.message}
                </span>
              )}
            </div>
          )}
        />
      </div>

      {/* 3. Soluções de IA já implementadas */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800">Quais soluções de IA você já implementou?</h3>
        <Controller
          control={control}
          name="implemented_solutions"
          rules={{ required: "Selecione pelo menos uma opção" }}
          render={({ field, fieldState }) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {implementedSolutionsOptions.map((solution) => (
                <label key={solution} className="flex items-center gap-2">
                  <Checkbox
                    checked={field.value?.includes(solution)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([...(field.value || []), solution]);
                      } else {
                        field.onChange(
                          field.value?.filter((s: string) => s !== solution) || []
                        );
                      }
                    }}
                    id={`implemented-${solution}`}
                  />
                  <span className="text-sm">{solution}</span>
                </label>
              ))}
              {fieldState.error && (
                <span className="text-red-500 text-xs col-span-full">
                  {fieldState.error.message}
                </span>
              )}
            </div>
          )}
        />
      </div>

      {/* 4. Soluções desejadas por categoria */}
      <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800">Quais soluções você deseja implementar no seu negócio?</h3>
        <Controller
          control={control}
          name="desired_solutions"
          rules={{ required: "Selecione pelo menos uma opção" }}
          render={({ field, fieldState }) => (
            <div className="space-y-8">
              {/* Marketing Solutions */}
              <div className="space-y-3">
                <h4 className="font-medium text-[#0ABAB5]">Soluções de Marketing com IA</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 border-l-2 border-[#0ABAB5]/30">
                  {marketingSolutions.map((solution) => (
                    <label key={solution} className="flex items-center gap-2">
                      <Checkbox
                        checked={field.value?.includes(solution)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value || []), solution]);
                          } else {
                            field.onChange(
                              field.value?.filter((s: string) => s !== solution) || []
                            );
                          }
                        }}
                        id={`desired-${solution}`}
                      />
                      <span className="text-sm">{solution}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sales Solutions */}
              <div className="space-y-3">
                <h4 className="font-medium text-[#0ABAB5]">Soluções de Vendas com IA</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 border-l-2 border-[#0ABAB5]/30">
                  {salesSolutions.map((solution) => (
                    <label key={solution} className="flex items-center gap-2">
                      <Checkbox
                        checked={field.value?.includes(solution)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value || []), solution]);
                          } else {
                            field.onChange(
                              field.value?.filter((s: string) => s !== solution) || []
                            );
                          }
                        }}
                        id={`desired-${solution}`}
                      />
                      <span className="text-sm">{solution}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* HR Solutions */}
              <div className="space-y-3">
                <h4 className="font-medium text-[#0ABAB5]">Soluções de RH com IA</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 border-l-2 border-[#0ABAB5]/30">
                  {hrSolutions.map((solution) => (
                    <label key={solution} className="flex items-center gap-2">
                      <Checkbox
                        checked={field.value?.includes(solution)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value || []), solution]);
                          } else {
                            field.onChange(
                              field.value?.filter((s: string) => s !== solution) || []
                            );
                          }
                        }}
                        id={`desired-${solution}`}
                      />
                      <span className="text-sm">{solution}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Process Solutions */}
              <div className="space-y-3">
                <h4 className="font-medium text-[#0ABAB5]">Soluções de Processos com IA</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 border-l-2 border-[#0ABAB5]/30">
                  {processSolutions.map((solution) => (
                    <label key={solution} className="flex items-center gap-2">
                      <Checkbox
                        checked={field.value?.includes(solution)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value || []), solution]);
                          } else {
                            field.onChange(
                              field.value?.filter((s: string) => s !== solution) || []
                            );
                          }
                        }}
                        id={`desired-${solution}`}
                      />
                      <span className="text-sm">{solution}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Customer Solutions */}
              <div className="space-y-3">
                <h4 className="font-medium text-[#0ABAB5]">Soluções de Atendimento ao Cliente com IA</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 border-l-2 border-[#0ABAB5]/30">
                  {customerSolutions.map((solution) => (
                    <label key={solution} className="flex items-center gap-2">
                      <Checkbox
                        checked={field.value?.includes(solution)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value || []), solution]);
                          } else {
                            field.onChange(
                              field.value?.filter((s: string) => s !== solution) || []
                            );
                          }
                        }}
                        id={`desired-${solution}`}
                      />
                      <span className="text-sm">{solution}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* General Solutions */}
              <div className="space-y-3">
                <h4 className="font-medium text-[#0ABAB5]">Soluções Gerais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 border-l-2 border-[#0ABAB5]/30">
                  {generalSolutions.map((solution) => (
                    <label key={solution} className="flex items-center gap-2">
                      <Checkbox
                        checked={field.value?.includes(solution)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value || []), solution]);
                          } else {
                            field.onChange(
                              field.value?.filter((s: string) => s !== solution) || []
                            );
                          }
                        }}
                        id={`desired-${solution}`}
                      />
                      <span className="text-sm">{solution}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {fieldState.error && (
                <span className="text-red-500 text-xs block mt-2">
                  {fieldState.error.message}
                </span>
              )}
            </div>
          )}
        />
      </div>

      {/* 5. Tentativas anteriores de implementação de IA */}
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

      {/* 6 & 7. VIVER DE IA perguntas */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800">Você já completou a Formação VIVER DE IA?</h3>
          <p className="text-sm text-gray-500 mb-3">Informação importante para personalizar sua experiência.</p>
          <Controller
            control={control}
            name="completed_formation"
            render={({ field }) => (
              <div className="flex items-center space-x-3">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="completed-formation"
                />
                <Label htmlFor="completed-formation">
                  {field.value ? "Sim" : "Não"}
                </Label>
              </div>
            )}
          />
        </div>

        <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800">Você já é membro do VIVER DE IA Club há mais de um mês?</h3>
          <p className="text-sm text-gray-500 mb-3">Precisamos entender sua experiência no Club até agora.</p>
          <Controller
            control={control}
            name="is_member_for_month"
            render={({ field }) => (
              <div className="flex items-center space-x-3">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="is-member-month"
                />
                <Label htmlFor="is-member-month">
                  {field.value ? "Sim" : "Não"}
                </Label>
              </div>
            )}
          />
        </div>
      </div>

      {/* 8. NPS - Escala de recomendação */}
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

      {/* 9. Sugestões abertas */}
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

      <Button
        type="submit"
        className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Salvando..." : isLastStep ? "Finalizar" : "Continuar"}
      </Button>
    </form>
  );
};
