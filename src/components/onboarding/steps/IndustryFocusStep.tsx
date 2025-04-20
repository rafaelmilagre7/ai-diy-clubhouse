
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OnboardingData } from "@/types/onboarding";

interface IndustryFocusStepProps {
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete: () => void;
  initialData?: OnboardingData['industry_focus'];
}

export const IndustryFocusStep = ({
  onSubmit,
  isSubmitting,
  initialData,
}: IndustryFocusStepProps) => {
  const [sector, setSector] = useState(initialData?.sector || '');
  const [targetMarket, setTargetMarket] = useState(initialData?.target_market || '');
  const [mainChallenges, setMainChallenges] = useState<string[]>(initialData?.main_challenges || []);

  const challengeOptions = [
    { id: 'competition', label: 'Alta competição no mercado' },
    { id: 'customer_acquisition', label: 'Aquisição de clientes' },
    { id: 'retention', label: 'Retenção de clientes' },
    { id: 'technology', label: 'Acompanhar avanços tecnológicos' },
    { id: 'scaling', label: 'Escalabilidade' },
    { id: 'regulation', label: 'Regulamentações e conformidade' },
    { id: 'talent', label: 'Atração e retenção de talentos' },
  ];

  const handleChallengeChange = (challengeId: string) => {
    setMainChallenges(current =>
      current.includes(challengeId)
        ? current.filter(id => id !== challengeId)
        : [...current, challengeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit('industry', {
      industry_focus: {
        sector,
        target_market: targetMarket,
        main_challenges: mainChallenges,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sector">Setor de atuação</Label>
          <Select
            value={sector}
            onValueChange={setSector}
            required
          >
            <SelectTrigger id="sector">
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Tecnologia e Software</SelectItem>
              <SelectItem value="retail">Varejo e E-commerce</SelectItem>
              <SelectItem value="finance">Finanças e Seguros</SelectItem>
              <SelectItem value="healthcare">Saúde e Bem-estar</SelectItem>
              <SelectItem value="education">Educação</SelectItem>
              <SelectItem value="manufacturing">Indústria e Manufatura</SelectItem>
              <SelectItem value="services">Serviços Profissionais</SelectItem>
              <SelectItem value="real_estate">Imobiliário</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-market">Mercado-alvo principal</Label>
          <Input
            id="target-market"
            placeholder="Descreva seu mercado-alvo principal"
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Principais desafios do setor</Label>
          <div className="space-y-2">
            {challengeOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`challenge-${option.id}`}
                  checked={mainChallenges.includes(option.id)}
                  onCheckedChange={() => handleChallengeChange(option.id)}
                />
                <Label htmlFor={`challenge-${option.id}`} className="cursor-pointer font-normal">
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
