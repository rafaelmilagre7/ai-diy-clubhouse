
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { toast } from "sonner";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface OnboardingStepProps {
  onSubmit: (stepId: string, data: any) => void;
  isSubmitting: boolean;
  isLastStep?: boolean;
  onComplete?: () => void;
  initialData?: any;
}

export const BusinessContextStep = ({ onSubmit, isSubmitting, initialData }: OnboardingStepProps) => {
  const [businessModel, setBusinessModel] = useState(initialData?.business_model || "");
  const [businessChallenges, setBusinessChallenges] = useState(initialData?.business_challenges || []);
  const [shortTermGoals, setShortTermGoals] = useState(initialData?.short_term_goals || []);
  const [importantKpis, setImportantKpis] = useState(initialData?.important_kpis || []);
  const [additionalContext, setAdditionalContext] = useState(initialData?.additional_context || "");

  const businessModelOptions = [
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
    { id: "agency", label: "Agência" }
  ];

  const businessChallengesOptions = [
    { id: "growth", label: "Crescimento acelerado" },
    { id: "leads", label: "Geração de leads qualificados" },
    { id: "automation", label: "Automação de processos" },
    { id: "conversion", label: "Conversão de vendas" },
    { id: "retention", label: "Retenção de clientes" },
    { id: "ai-implementation", label: "Implementação eficiente de IA" },
    { id: "data-analysis", label: "Análise e uso efetivo de dados" },
    { id: "team-training", label: "Capacitação de equipe em IA" },
    { id: "cost-optimization", label: "Otimização de custos" },
    { id: "product-development", label: "Desenvolvimento de novos produtos" }
  ];

  const shortTermGoalsOptions = [
    { id: "first-ai-solution", label: "Implementar primeira solução de IA no negócio" },
    { id: "automate-customer-service", label: "Automatizar processo de atendimento" },
    { id: "virtual-assistant", label: "Criar assistente virtual para área comercial" },
    { id: "optimize-internal-processes", label: "Otimizar processos internos com IA" },
    { id: "ai-content", label: "Desenvolver conteúdo com auxílio de IA" },
    { id: "team-training", label: "Treinar equipe em ferramentas de IA" },
    { id: "ai-marketing", label: "Implementar estratégia de marketing com IA" },
    { id: "sales-conversion", label: "Aumentar conversão de vendas com IA" },
    { id: "cost-reduction", label: "Reduzir custos operacionais com automação" },
    { id: "new-product", label: "Lançar novo produto/serviço utilizando IA" }
  ];

  const kpiOptions = [
    { id: "revenue", label: "Receita" },
    { id: "profit", label: "Lucro" },
    { id: "customer-acquisition", label: "Aquisição de Clientes" },
    { id: "customer-retention", label: "Retenção de Clientes" },
    { id: "churn-rate", label: "Taxa de Churn" },
    { id: "cac", label: "CAC (Custo de Aquisição de Cliente)" },
    { id: "ltv", label: "LTV (Valor do Tempo de Vida do Cliente)" },
    { id: "mrr", label: "MRR (Receita Recorrente Mensal)" },
    { id: "conversion-rate", label: "Taxa de Conversão" },
    { id: "operational-efficiency", label: "Eficiência Operacional" },
    { id: "nps", label: "NPS (Net Promoter Score)" }
  ];

  const toggleBusinessChallenge = (id: string) => {
    setBusinessChallenges(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const toggleShortTermGoal = (id: string) => {
    setShortTermGoals(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const toggleKpi = (id: string) => {
    setImportantKpis(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const schema = z.object({
    business_model: z.string().min(1, "Selecione um modelo de negócio"),
    business_challenges: z.array(z.string()).min(1, "Selecione pelo menos um desafio"),
    short_term_goals: z.array(z.string()).min(1, "Selecione pelo menos um objetivo"),
    important_kpis: z.array(z.string()).min(1, "Selecione pelo menos um KPI"),
    additional_context: z.string().optional(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      business_model: businessModel,
      business_challenges: businessChallenges,
      short_term_goals: shortTermGoals,
      important_kpis: importantKpis,
      additional_context: additionalContext,
    };
    
    try {
      schema.parse(formData);
      onSubmit("business_context", { business_context: formData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      } else {
        toast.error("Verifique os campos e tente novamente.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <MilagrinhoMessage 
        message="Agora vamos entender o contexto do seu negócio para recomendar as melhores soluções de IA para você."
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <Label className="text-base font-medium">
            Modelo(s) de Negócio
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup value={businessModel} onValueChange={setBusinessModel} className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {businessModelOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={`business-model-${option.id}`} />
                <Label htmlFor={`business-model-${option.id}`} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">
            Principais Desafios do Negócio
            <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {businessChallengesOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`challenge-${option.id}`} 
                  checked={businessChallenges.includes(option.id)}
                  onCheckedChange={() => toggleBusinessChallenge(option.id)}
                />
                <Label htmlFor={`challenge-${option.id}`} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">
            Objetivos de Curto Prazo (3-6 meses)
            <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {shortTermGoalsOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`goal-${option.id}`} 
                  checked={shortTermGoals.includes(option.id)}
                  onCheckedChange={() => toggleShortTermGoal(option.id)}
                />
                <Label htmlFor={`goal-${option.id}`} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">
            Indicadores de Performance - KPIs Mais Importantes para o Negócio
            <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {kpiOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`kpi-${option.id}`} 
                  checked={importantKpis.includes(option.id)}
                  onCheckedChange={() => toggleKpi(option.id)}
                />
                <Label htmlFor={`kpi-${option.id}`} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="additional_context">
            Contexto adicional (opcional)
          </Label>
          <Textarea
            id="additional_context"
            placeholder="Algo mais que queira compartilhar sobre seu contexto de negócio..."
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            className="h-24"
          />
        </div>

        <Button type="submit" className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Continuar"}
        </Button>
      </form>
    </div>
  );
};
