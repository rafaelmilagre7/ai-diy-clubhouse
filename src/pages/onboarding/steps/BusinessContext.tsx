
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const businessModels = [
  { id: "b2b", label: "B2B - Business to Business" },
  { id: "b2c", label: "B2C - Business to Consumer" },
  { id: "b2b2c", label: "B2B2C - Business to Business to Consumer" },
  { id: "d2c", label: "D2C - Direct to Consumer" },
  { id: "saas", label: "SaaS - Software as a Service" },
  { id: "marketplace", label: "Marketplace" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "subscription", label: "Assinatura / Recorrência" },
  { id: "freelancer", label: "Freelancer / Autônomo" },
  { id: "consulting", label: "Consultoria" },
  { id: "agency", label: "Agência" },
];

const businessChallenges = [
  { id: "growth", label: "Crescimento acelerado" },
  { id: "leads", label: "Geração de leads qualificados" },
  { id: "automation", label: "Automação de processos" },
  { id: "conversion", label: "Conversão de vendas" },
  { id: "retention", label: "Retenção de clientes" },
  { id: "ai_implementation", label: "Implementação eficiente de IA" },
  { id: "data_analysis", label: "Análise e uso efetivo de dados" },
  { id: "team_training", label: "Capacitação de equipe em IA" },
  { id: "cost_optimization", label: "Otimização de custos" },
  { id: "product_development", label: "Desenvolvimento de novos produtos" }
];

const shortTermGoals = [
  { id: "first_ai_solution", label: "Implementar primeira solução de IA no negócio" },
  { id: "automate_support", label: "Automatizar processo de atendimento" },
  { id: "virtual_assistant", label: "Criar assistente virtual para área comercial" },
  { id: "optimize_processes", label: "Otimizar processos internos com IA" },
  { id: "ai_content", label: "Desenvolver conteúdo com auxílio de IA" },
  { id: "train_team", label: "Treinar equipe em ferramentas de IA" },
  { id: "ai_marketing", label: "Implementar estratégia de marketing com IA" },
  { id: "increase_sales", label: "Aumentar conversão de vendas com IA" },
  { id: "reduce_costs", label: "Reduzir custos operacionais com automação" },
  { id: "launch_product", label: "Lançar novo produto/serviço utilizando IA" }
];

const importantKpis = [
  { id: "revenue", label: "Receita" },
  { id: "profit", label: "Lucro" },
  { id: "customer_acquisition", label: "Aquisição de Clientes" },
  { id: "customer_retention", label: "Retenção de Clientes" },
  { id: "churn_rate", label: "Taxa de Churn" },
  { id: "cac", label: "CAC (Custo de Aquisição de Cliente)" },
  { id: "ltv", label: "LTV (Valor do Tempo de Vida do Cliente)" },
  { id: "mrr", label: "MRR (Receita Recorrente Mensal)" },
  { id: "conversion_rate", label: "Taxa de Conversão" },
  { id: "operational_efficiency", label: "Eficiência Operacional" },
  { id: "nps", label: "NPS (Net Promoter Score)" }
];

const BusinessContext = () => {
  const { saveStepData, currentStepIndex } = useOnboardingSteps();
  const navigate = useNavigate();
  const { progress, isLoading } = useProgress();
  
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      business_model: progress?.business_context?.business_model || "",
      business_challenges: progress?.business_context?.business_challenges || [],
      short_term_goals: progress?.business_context?.short_term_goals || [],
      important_kpis: progress?.business_context?.important_kpis || [],
      additional_context: progress?.business_context?.additional_context || ""
    }
  });

  const onSubmit = async (data) => {
    try {
      await saveStepData("business_context", data);
      toast.success("Informações salvas com sucesso!");
      navigate("/onboarding/ai-experience");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar as informações. Tente novamente.");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <OnboardingLayout currentStep={3} title="Carregando...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      currentStep={3} 
      title="Contexto do Negócio"
      backUrl="/onboarding/business-goals"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage 
          message="Agora vamos entender melhor o contexto do seu negócio. Estas informações nos ajudarão a recomendar as soluções de IA mais adequadas para seus desafios específicos."
        />
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Modelo de Negócio */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Modelo(s) de Negócio<span className="text-red-500">*</span></h3>
            <Controller
              name="business_model"
              control={control}
              rules={{ required: "Por favor, selecione um modelo de negócio" }}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2"
                >
                  {businessModels.map((model) => (
                    <div key={model.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={model.id} id={`model-${model.id}`} />
                      <Label htmlFor={`model-${model.id}`} className="cursor-pointer">{model.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
            {errors.business_model && (
              <p className="text-red-500 text-sm">{errors.business_model.message}</p>
            )}
          </div>

          {/* Principais Desafios */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Principais Desafios do Negócio<span className="text-red-500">*</span></h3>
            <p className="text-sm text-gray-500">Selecione até 5 opções</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <Controller
                name="business_challenges"
                control={control}
                rules={{ 
                  required: "Selecione pelo menos um desafio",
                  validate: value => value.length <= 5 || "Selecione no máximo 5 desafios"
                }}
                render={({ field }) => (
                  <>
                    {businessChallenges.map((challenge) => (
                      <div key={challenge.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`challenge-${challenge.id}`}
                          checked={field.value?.includes(challenge.id)}
                          onCheckedChange={(checked) => {
                            const updatedValue = checked 
                              ? [...field.value, challenge.id]
                              : field.value.filter(value => value !== challenge.id);
                            field.onChange(updatedValue);
                          }}
                        />
                        <label 
                          htmlFor={`challenge-${challenge.id}`}
                          className="text-sm leading-none cursor-pointer"
                        >
                          {challenge.label}
                        </label>
                      </div>
                    ))}
                  </>
                )}
              />
            </div>
            {errors.business_challenges && (
              <p className="text-red-500 text-sm">{errors.business_challenges.message}</p>
            )}
          </div>

          {/* Objetivos de Curto Prazo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Objetivos de Curto Prazo (3-6 meses)<span className="text-red-500">*</span></h3>
            <p className="text-sm text-gray-500">Selecione até 3 opções</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <Controller
                name="short_term_goals"
                control={control}
                rules={{ 
                  required: "Selecione pelo menos um objetivo",
                  validate: value => value.length <= 3 || "Selecione no máximo 3 objetivos"
                }}
                render={({ field }) => (
                  <>
                    {shortTermGoals.map((goal) => (
                      <div key={goal.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`goal-${goal.id}`}
                          checked={field.value?.includes(goal.id)}
                          onCheckedChange={(checked) => {
                            const updatedValue = checked 
                              ? [...field.value, goal.id]
                              : field.value.filter(value => value !== goal.id);
                            field.onChange(updatedValue);
                          }}
                        />
                        <label 
                          htmlFor={`goal-${goal.id}`}
                          className="text-sm leading-none cursor-pointer"
                        >
                          {goal.label}
                        </label>
                      </div>
                    ))}
                  </>
                )}
              />
            </div>
            {errors.short_term_goals && (
              <p className="text-red-500 text-sm">{errors.short_term_goals.message}</p>
            )}
          </div>

          {/* KPIs Importantes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">KPIs Mais Importantes para o Negócio<span className="text-red-500">*</span></h3>
            <p className="text-sm text-gray-500">Selecione até 5 opções</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <Controller
                name="important_kpis"
                control={control}
                rules={{ 
                  required: "Selecione pelo menos um KPI",
                  validate: value => value.length <= 5 || "Selecione no máximo 5 KPIs"
                }}
                render={({ field }) => (
                  <>
                    {importantKpis.map((kpi) => (
                      <div key={kpi.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`kpi-${kpi.id}`}
                          checked={field.value?.includes(kpi.id)}
                          onCheckedChange={(checked) => {
                            const updatedValue = checked 
                              ? [...field.value, kpi.id]
                              : field.value.filter(value => value !== kpi.id);
                            field.onChange(updatedValue);
                          }}
                        />
                        <label 
                          htmlFor={`kpi-${kpi.id}`}
                          className="text-sm leading-none cursor-pointer"
                        >
                          {kpi.label}
                        </label>
                      </div>
                    ))}
                  </>
                )}
              />
            </div>
            {errors.important_kpis && (
              <p className="text-red-500 text-sm">{errors.important_kpis.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <Button type="submit" className="bg-[#0ABAB5] hover:bg-[#09a29d]" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Continuar"}
            </Button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
};

export default BusinessContext;
