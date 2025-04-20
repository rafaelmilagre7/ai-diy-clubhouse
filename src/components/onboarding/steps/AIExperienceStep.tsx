
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OnboardingData } from "@/types/onboarding";

interface AIExperienceStepProps {
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete: () => void;
  initialData?: OnboardingData['ai_experience'];
}

export const AIExperienceStep = ({
  onSubmit,
  isSubmitting,
  initialData,
}: AIExperienceStepProps) => {
  const [knowledgeLevel, setKnowledgeLevel] = useState(initialData?.knowledge_level || '');
  const [previousTools, setPreviousTools] = useState<string[]>(initialData?.previous_tools || []);
  const [challenges, setChallenges] = useState<string[]>(initialData?.challenges || []);

  const toolOptions = [
    { id: 'chatgpt', label: 'ChatGPT' },
    { id: 'claude', label: 'Claude' },
    { id: 'midjourney', label: 'Midjourney' },
    { id: 'dall_e', label: 'DALL-E' },
    { id: 'jasper', label: 'Jasper' },
    { id: 'zapier', label: 'Zapier' },
    { id: 'other', label: 'Outros' },
  ];

  const challengeOptions = [
    { id: 'technical', label: 'Dificuldades técnicas' },
    { id: 'cost', label: 'Custo elevado' },
    { id: 'time', label: 'Falta de tempo' },
    { id: 'knowledge', label: 'Falta de conhecimento' },
    { id: 'integration', label: 'Dificuldade de integração' },
    { id: 'quality', label: 'Qualidade dos resultados' },
    { id: 'resistance', label: 'Resistência da equipe' },
  ];

  const handleToolChange = (toolId: string) => {
    setPreviousTools(current =>
      current.includes(toolId)
        ? current.filter(id => id !== toolId)
        : [...current, toolId]
    );
  };

  const handleChallengeChange = (challengeId: string) => {
    setChallenges(current =>
      current.includes(challengeId)
        ? current.filter(id => id !== challengeId)
        : [...current, challengeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit('ai_exp', {
      ai_experience: {
        knowledge_level: knowledgeLevel,
        previous_tools: previousTools,
        challenges: challenges,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="knowledge-level">Nível de conhecimento em IA</Label>
          <Select
            value={knowledgeLevel}
            onValueChange={setKnowledgeLevel}
            required
          >
            <SelectTrigger id="knowledge-level">
              <SelectValue placeholder="Selecione seu nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Iniciante (pouco ou nenhum conhecimento)</SelectItem>
              <SelectItem value="intermediate">Intermediário (uso básico)</SelectItem>
              <SelectItem value="advanced">Avançado (uso regular)</SelectItem>
              <SelectItem value="expert">Especialista (domínio técnico)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Ferramentas de IA já utilizadas</Label>
          <div className="space-y-2">
            {toolOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`tool-${option.id}`}
                  checked={previousTools.includes(option.id)}
                  onCheckedChange={() => handleToolChange(option.id)}
                />
                <Label htmlFor={`tool-${option.id}`} className="cursor-pointer font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Desafios encontrados com IA</Label>
          <div className="space-y-2">
            {challengeOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`challenge-${option.id}`}
                  checked={challenges.includes(option.id)}
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
