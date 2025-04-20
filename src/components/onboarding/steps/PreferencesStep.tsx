
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OnboardingData } from "@/types/onboarding";

interface PreferencesStepProps {
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete: () => void;
  initialData?: OnboardingData['implementation_preferences'];
}

export const PreferencesStep = ({
  onSubmit,
  isSubmitting,
  isLastStep,
  onComplete,
  initialData,
}: PreferencesStepProps) => {
  const [priorityAreas, setPriorityAreas] = useState<string[]>(initialData?.priority_areas || []);
  const [implementationSpeed, setImplementationSpeed] = useState(initialData?.implementation_speed || '');
  const [supportLevel, setSupportLevel] = useState(initialData?.support_level || '');

  const priorityOptions = [
    { id: 'marketing', label: 'Marketing e Vendas' },
    { id: 'customer_service', label: 'Atendimento ao Cliente' },
    { id: 'product_development', label: 'Desenvolvimento de Produto' },
    { id: 'operations', label: 'Operações' },
    { id: 'finance', label: 'Finanças' },
    { id: 'hr', label: 'Recursos Humanos' },
    { id: 'it', label: 'TI e Infraestrutura' },
  ];

  const handlePriorityChange = (areaId: string) => {
    setPriorityAreas(current =>
      current.includes(areaId)
        ? current.filter(id => id !== areaId)
        : [...current, areaId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      implementation_preferences: {
        priority_areas: priorityAreas,
        implementation_speed: implementationSpeed,
        support_level: supportLevel,
      },
    };
    
    if (isLastStep) {
      onSubmit('preferences', data);
      onComplete();
    } else {
      onSubmit('preferences', data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Áreas prioritárias para implementação</Label>
          <div className="space-y-2">
            {priorityOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${option.id}`}
                  checked={priorityAreas.includes(option.id)}
                  onCheckedChange={() => handlePriorityChange(option.id)}
                />
                <Label htmlFor={`priority-${option.id}`} className="cursor-pointer font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="implementation-speed">Velocidade de implementação preferida</Label>
          <Select
            value={implementationSpeed}
            onValueChange={setImplementationSpeed}
            required
          >
            <SelectTrigger id="implementation-speed">
              <SelectValue placeholder="Selecione a velocidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fast">Rápida (resultados imediatos)</SelectItem>
              <SelectItem value="moderate">Moderada (balanceada)</SelectItem>
              <SelectItem value="slow">Gradual (implementação cuidadosa)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="support-level">Nível de suporte desejado</Label>
          <Select
            value={supportLevel}
            onValueChange={setSupportLevel}
            required
          >
            <SelectTrigger id="support-level">
              <SelectValue placeholder="Selecione o nível de suporte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self_service">Autoatendimento (recursos e guias)</SelectItem>
              <SelectItem value="basic">Suporte básico (por e-mail)</SelectItem>
              <SelectItem value="standard">Suporte padrão (e-mail e chat)</SelectItem>
              <SelectItem value="premium">Suporte premium (dedicado)</SelectItem>
              <SelectItem value="full_service">Implementação completa (serviço gerenciado)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : isLastStep ? "Finalizar" : "Continuar"}
      </Button>
    </form>
  );
};
