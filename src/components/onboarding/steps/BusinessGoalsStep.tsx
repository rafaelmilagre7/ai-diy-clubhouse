
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OnboardingData } from "@/types/onboarding";

interface BusinessGoalsStepProps {
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete: () => void;
  initialData?: OnboardingData['business_goals'];
}

export const BusinessGoalsStep = ({
  onSubmit,
  isSubmitting,
  initialData,
}: BusinessGoalsStepProps) => {
  const [primaryGoal, setPrimaryGoal] = useState(initialData?.primary_goal || '');
  const [expectedOutcomes, setExpectedOutcomes] = useState<string[]>(initialData?.expected_outcomes || []);
  const [timeline, setTimeline] = useState(initialData?.timeline || '');

  const outcomeOptions = [
    { id: 'increase_revenue', label: 'Aumentar receita' },
    { id: 'reduce_costs', label: 'Reduzir custos' },
    { id: 'improve_efficiency', label: 'Melhorar eficiência' },
    { id: 'enhance_customer_experience', label: 'Melhorar experiência do cliente' },
    { id: 'launch_new_products', label: 'Lançar novos produtos/serviços' },
    { id: 'expansion', label: 'Expansão para novos mercados' },
  ];

  const handleOutcomeChange = (outcomeId: string) => {
    setExpectedOutcomes(current =>
      current.includes(outcomeId)
        ? current.filter(id => id !== outcomeId)
        : [...current, outcomeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit('goals', {
      business_goals: {
        primary_goal: primaryGoal,
        expected_outcomes: expectedOutcomes,
        timeline: timeline,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="primary-goal">Objetivo principal com IA</Label>
          <Select
            value={primaryGoal}
            onValueChange={setPrimaryGoal}
            required
          >
            <SelectTrigger id="primary-goal">
              <SelectValue placeholder="Selecione seu objetivo principal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automation">Automação de processos</SelectItem>
              <SelectItem value="customer_service">Melhorar atendimento ao cliente</SelectItem>
              <SelectItem value="data_analysis">Análise de dados</SelectItem>
              <SelectItem value="content_creation">Criação de conteúdo</SelectItem>
              <SelectItem value="innovation">Inovação de produtos/serviços</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Resultados esperados (selecione todos aplicáveis)</Label>
          <div className="space-y-2">
            {outcomeOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={expectedOutcomes.includes(option.id)}
                  onCheckedChange={() => handleOutcomeChange(option.id)}
                />
                <Label htmlFor={option.id} className="cursor-pointer font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline">Prazo para implementação</Label>
          <Select
            value={timeline}
            onValueChange={setTimeline}
            required
          >
            <SelectTrigger id="timeline">
              <SelectValue placeholder="Selecione o prazo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1_month">Até 1 mês</SelectItem>
              <SelectItem value="3_months">1-3 meses</SelectItem>
              <SelectItem value="6_months">3-6 meses</SelectItem>
              <SelectItem value="12_months">6-12 meses</SelectItem>
              <SelectItem value="long_term">Mais de 12 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Continuar"}
      </Button>
    </form>
  );
};
