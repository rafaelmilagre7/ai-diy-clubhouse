
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OnboardingData } from "@/types/onboarding";

interface TeamInfoStepProps {
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete: () => void;
  initialData?: OnboardingData['team_info'];
}

export const TeamInfoStep = ({
  onSubmit,
  isSubmitting,
  initialData,
}: TeamInfoStepProps) => {
  const [decisionMakers, setDecisionMakers] = useState<string[]>(initialData?.decision_makers || []);
  const [technicalExpertise, setTechnicalExpertise] = useState(initialData?.technical_expertise || '');
  const [trainingNeeds, setTrainingNeeds] = useState<string[]>(initialData?.training_needs || []);

  const decisionMakerOptions = [
    { id: 'ceo', label: 'CEO/Presidente' },
    { id: 'cto', label: 'CTO/Diretor de Tecnologia' },
    { id: 'coo', label: 'COO/Diretor de Operações' },
    { id: 'cmo', label: 'CMO/Diretor de Marketing' },
    { id: 'it_manager', label: 'Gerente de TI' },
    { id: 'innovation_director', label: 'Diretor de Inovação' },
    { id: 'other', label: 'Outro' },
  ];

  const trainingOptions = [
    { id: 'basic_ai', label: 'Fundamentos de IA' },
    { id: 'tool_training', label: 'Treinamento em ferramentas específicas' },
    { id: 'implementation', label: 'Implementação prática' },
    { id: 'advanced_techniques', label: 'Técnicas avançadas' },
    { id: 'change_management', label: 'Gestão de mudança' },
    { id: 'none', label: 'Nenhuma necessidade específica' },
  ];

  const handleDecisionMakerChange = (dmId: string) => {
    setDecisionMakers(current =>
      current.includes(dmId)
        ? current.filter(id => id !== dmId)
        : [...current, dmId]
    );
  };

  const handleTrainingNeedsChange = (needId: string) => {
    setTrainingNeeds(current =>
      current.includes(needId)
        ? current.filter(id => id !== needId)
        : [...current, needId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit('team', {
      team_info: {
        decision_makers: decisionMakers,
        technical_expertise: technicalExpertise,
        training_needs: trainingNeeds,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Tomadores de decisão para projetos de IA</Label>
          <div className="space-y-2">
            {decisionMakerOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`dm-${option.id}`}
                  checked={decisionMakers.includes(option.id)}
                  onCheckedChange={() => handleDecisionMakerChange(option.id)}
                />
                <Label htmlFor={`dm-${option.id}`} className="cursor-pointer font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="technical-expertise">Nível de expertise técnica da equipe</Label>
          <Select
            value={technicalExpertise}
            onValueChange={setTechnicalExpertise}
            required
          >
            <SelectTrigger id="technical-expertise">
              <SelectValue placeholder="Selecione o nível de expertise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma expertise técnica</SelectItem>
              <SelectItem value="basic">Conhecimentos básicos</SelectItem>
              <SelectItem value="intermediate">Conhecimentos intermediários</SelectItem>
              <SelectItem value="advanced">Conhecimentos avançados</SelectItem>
              <SelectItem value="expert">Equipe especializada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Necessidades de treinamento</Label>
          <div className="space-y-2">
            {trainingOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`training-${option.id}`}
                  checked={trainingNeeds.includes(option.id)}
                  onCheckedChange={() => handleTrainingNeedsChange(option.id)}
                />
                <Label htmlFor={`training-${option.id}`} className="cursor-pointer font-normal">
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
