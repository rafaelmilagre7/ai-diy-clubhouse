
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OnboardingData } from "@/types/onboarding";

interface ResourcesNeedsStepProps {
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete: () => void;
  initialData?: OnboardingData['resources_needs'];
}

export const ResourcesNeedsStep = ({
  onSubmit,
  isSubmitting,
  initialData,
}: ResourcesNeedsStepProps) => {
  const [budgetRange, setBudgetRange] = useState(initialData?.budget_range || '');
  const [teamSize, setTeamSize] = useState(initialData?.team_size || '');
  const [techStack, setTechStack] = useState<string[]>(initialData?.tech_stack || []);

  const techOptions = [
    { id: 'website', label: 'Website/Landing Page' },
    { id: 'ecommerce', label: 'E-commerce' },
    { id: 'crm', label: 'CRM' },
    { id: 'erp', label: 'ERP' },
    { id: 'social_media', label: 'Redes Sociais' },
    { id: 'analytics', label: 'Ferramentas de Analytics' },
    { id: 'automation', label: 'Ferramentas de Automação' },
    { id: 'custom_software', label: 'Software Personalizado' },
  ];

  const handleTechChange = (techId: string) => {
    setTechStack(current =>
      current.includes(techId)
        ? current.filter(id => id !== techId)
        : [...current, techId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit('resources', {
      resources_needs: {
        budget_range: budgetRange,
        team_size: teamSize,
        tech_stack: techStack,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="budget-range">Faixa de orçamento para IA</Label>
          <Select
            value={budgetRange}
            onValueChange={setBudgetRange}
            required
          >
            <SelectTrigger id="budget-range">
              <SelectValue placeholder="Selecione a faixa de orçamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under_5k">Até R$ 5.000/mês</SelectItem>
              <SelectItem value="5k_15k">R$ 5.000 - R$ 15.000/mês</SelectItem>
              <SelectItem value="15k_30k">R$ 15.000 - R$ 30.000/mês</SelectItem>
              <SelectItem value="30k_50k">R$ 30.000 - R$ 50.000/mês</SelectItem>
              <SelectItem value="above_50k">Acima de R$ 50.000/mês</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="team-size">Tamanho da equipe de tecnologia</Label>
          <Select
            value={teamSize}
            onValueChange={setTeamSize}
            required
          >
            <SelectTrigger id="team-size">
              <SelectValue placeholder="Selecione o tamanho da equipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem equipe técnica</SelectItem>
              <SelectItem value="1_2">1-2 pessoas</SelectItem>
              <SelectItem value="3_5">3-5 pessoas</SelectItem>
              <SelectItem value="6_10">6-10 pessoas</SelectItem>
              <SelectItem value="10_plus">Mais de 10 pessoas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Stack tecnológica atual</Label>
          <div className="space-y-2">
            {techOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`tech-${option.id}`}
                  checked={techStack.includes(option.id)}
                  onCheckedChange={() => handleTechChange(option.id)}
                />
                <Label htmlFor={`tech-${option.id}`} className="cursor-pointer font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Continuar"}
      </Button>
    </form>
  );
};
