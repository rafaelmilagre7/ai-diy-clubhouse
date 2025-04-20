
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingData } from "@/types/onboarding";

interface PersonalInfoStepProps {
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete: () => void;
  initialData?: OnboardingData['personal_info'];
}

export const PersonalInfoStep = ({
  onSubmit,
  isSubmitting,
  initialData,
}: PersonalInfoStepProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [role, setRole] = useState(initialData?.role || '');
  const [companySize, setCompanySize] = useState(initialData?.company_size || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit('personal', {
      personal_info: {
        name,
        role,
        company_size: companySize,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Sua função na empresa</Label>
          <Input
            id="role"
            placeholder="Ex: CEO, Diretor de Marketing, etc."
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-size">Tamanho da empresa</Label>
          <Select
            value={companySize}
            onValueChange={setCompanySize}
            required
          >
            <SelectTrigger id="company-size">
              <SelectValue placeholder="Selecione o tamanho da empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 funcionários</SelectItem>
              <SelectItem value="11-50">11-50 funcionários</SelectItem>
              <SelectItem value="51-200">51-200 funcionários</SelectItem>
              <SelectItem value="201-500">201-500 funcionários</SelectItem>
              <SelectItem value="500+">500+ funcionários</SelectItem>
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
