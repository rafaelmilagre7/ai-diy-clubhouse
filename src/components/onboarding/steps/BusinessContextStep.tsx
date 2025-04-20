
import React, { useState, useEffect } from "react";
import { NavigationButtons } from "./NavigationButtons";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { MilagrinhoAssistant } from "./MilagrinhoAssistant";

interface BusinessContextStepProps {
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => Promise<void>;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete?: () => Promise<void>;
  initialData?: OnboardingProgress | any;
}

const businessModelOptions = [
  "B2B - Business to Business",
  "B2C - Business to Consumer",
  "B2B2C - Business to Business to Consumer",
  "D2C - Direct to Consumer",
  "SaaS - Software as a Service",
  "Marketplace",
  "E-commerce",
  "Assinatura / Recorrência",
  "Freelancer / Autônomo",
  "Consultoria",
  "Agência",
];

const businessChallengesOptions = [
  "Crescimento acelerado",
  "Geração de leads qualificados",
  "Automação de processos",
  "Conversão de vendas",
  "Retenção de clientes",
  "Implementação eficiente de IA",
  "Análise e uso efetivo de dados",
  "Capacitação de equipe em IA",
  "Otimização de custos",
  "Desenvolvimento de novos produtos",
];

const shortTermGoalsOptions = [
  "Implementar primeira solução de IA no negócio",
  "Automatizar processo de atendimento",
  "Criar assistente virtual para área comercial",
  "Otimizar processos internos com IA",
  "Desenvolver conteúdo com auxílio de IA",
  "Treinar equipe em ferramentas de IA",
  "Implementar estratégia de marketing com IA",
  "Aumentar conversão de vendas com IA",
  "Reduzir custos operacionais com automação",
  "Lançar novo produto/serviço utilizando IA",
];

const kpiOptions = [
  "Receita",
  "Lucro",
  "Aquisição de Clientes",
  "Retenção de Clientes",
  "Taxa de Churn",
  "CAC (Custo de Aquisição de Cliente)",
  "LTV (Valor do Tempo de Vida do Cliente)",
  "MRR (Receita Recorrente Mensal)",
  "Taxa de Conversão",
  "Eficiência Operacional",
  "NPS (Net Promoter Score)",
];

export const BusinessContextStep: React.FC<BusinessContextStepProps> = ({
  onSubmit,
  isSubmitting,
  isLastStep,
  onComplete,
  initialData,
}) => {
  const [businessModel, setBusinessModel] = useState<string>("");
  const [businessChallenges, setBusinessChallenges] = useState<string[]>([]);
  const [shortTermGoals, setShortTermGoals] = useState<string[]>([]);
  const [importantKpis, setImportantKpis] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados iniciais se disponíveis
  useEffect(() => {
    if (initialData?.business_context) {
      const contextData = initialData.business_context;
      if (contextData.business_model) setBusinessModel(contextData.business_model);
      if (contextData.business_challenges) setBusinessChallenges(contextData.business_challenges);
      if (contextData.short_term_goals) setShortTermGoals(contextData.short_term_goals);
      if (contextData.important_kpis) setImportantKpis(contextData.important_kpis);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!businessModel) {
      newErrors.businessModel = "Selecione um modelo de negócio";
    }
    
    if (businessChallenges.length === 0) {
      newErrors.businessChallenges = "Selecione pelo menos um desafio";
    }

    if (shortTermGoals.length === 0) {
      newErrors.shortTermGoals = "Selecione pelo menos um objetivo";
    }

    if (importantKpis.length === 0) {
      newErrors.importantKpis = "Selecione pelo menos um KPI";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const data: Partial<OnboardingData> = {
      business_context: {
        business_model: businessModel,
        business_challenges: businessChallenges,
        short_term_goals: shortTermGoals,
        important_kpis: importantKpis,
      },
    };

    await onSubmit("business_context", data);
  };

  const handleCheckboxChange = (
    value: string,
    currentValues: string[],
    setValues: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    setValues(updatedValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <MilagrinhoAssistant
        message="Vamos conhecer um pouco mais sobre o contexto do seu negócio para personalizar as soluções de IA mais adequadas."
        className="mb-6"
      />

      {/* Modelo de Negócio */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">
            Modelo(s) de Negócio<span className="text-[#0ABAB5] ml-1">*</span>
          </Label>
          {errors.businessModel && (
            <p className="text-sm text-red-500">{errors.businessModel}</p>
          )}
        </div>
        
        <RadioGroup 
          className="grid grid-cols-1 md:grid-cols-2 gap-3" 
          value={businessModel}
          onValueChange={setBusinessModel}
        >
          {businessModelOptions.map((model) => (
            <div 
              key={model}
              className="flex items-center space-x-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
            >
              <RadioGroupItem value={model} id={`model-${model}`} />
              <Label htmlFor={`model-${model}`} className="cursor-pointer font-medium">
                {model}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Principais Desafios */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">
            Principais Desafios do Negócio<span className="text-[#0ABAB5] ml-1">*</span>
          </Label>
          {errors.businessChallenges && (
            <p className="text-sm text-red-500">{errors.businessChallenges}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {businessChallengesOptions.map((challenge) => (
            <div 
              key={challenge}
              className="flex items-center space-x-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
            >
              <Checkbox 
                id={`challenge-${challenge}`} 
                checked={businessChallenges.includes(challenge)}
                onCheckedChange={() => handleCheckboxChange(challenge, businessChallenges, setBusinessChallenges)}
              />
              <Label htmlFor={`challenge-${challenge}`} className="cursor-pointer font-medium">
                {challenge}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Objetivos de Curto Prazo */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">
            Objetivos de Curto Prazo (3-6 meses)<span className="text-[#0ABAB5] ml-1">*</span>
          </Label>
          {errors.shortTermGoals && (
            <p className="text-sm text-red-500">{errors.shortTermGoals}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shortTermGoalsOptions.map((goal) => (
            <div 
              key={goal}
              className="flex items-center space-x-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
            >
              <Checkbox 
                id={`goal-${goal}`} 
                checked={shortTermGoals.includes(goal)}
                onCheckedChange={() => handleCheckboxChange(goal, shortTermGoals, setShortTermGoals)}
              />
              <Label htmlFor={`goal-${goal}`} className="cursor-pointer font-medium">
                {goal}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs Importantes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">
            KPIs Mais Importantes para o Negócio<span className="text-[#0ABAB5] ml-1">*</span>
          </Label>
          {errors.importantKpis && (
            <p className="text-sm text-red-500">{errors.importantKpis}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {kpiOptions.map((kpi) => (
            <div 
              key={kpi}
              className="flex items-center space-x-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
            >
              <Checkbox 
                id={`kpi-${kpi}`} 
                checked={importantKpis.includes(kpi)}
                onCheckedChange={() => handleCheckboxChange(kpi, importantKpis, setImportantKpis)}
              />
              <Label htmlFor={`kpi-${kpi}`} className="cursor-pointer font-medium">
                {kpi}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <NavigationButtons isSubmitting={isSubmitting} />
    </form>
  );
};
