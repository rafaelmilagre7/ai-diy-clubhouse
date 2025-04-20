
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { toast } from "sonner";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";

interface OnboardingStepProps {
  onSubmit: (stepId: string, data: any) => void;
  isSubmitting: boolean;
  isLastStep?: boolean;
  onComplete?: () => void;
  initialData?: any;
}

export const BusinessContextStep = ({ onSubmit, isSubmitting, initialData }: OnboardingStepProps) => {
  const [businessContext, setBusinessContext] = useState({
    business_model: initialData?.business_model || "",
    business_challenges: initialData?.business_challenges || "",
    short_term_goals: initialData?.short_term_goals || "",
    important_kpis: initialData?.important_kpis || "",
    additional_context: initialData?.additional_context || "",
  });

  const handleChange = (field: string, value: string) => {
    setBusinessContext({
      ...businessContext,
      [field]: value,
    });
  };

  const schema = z.object({
    business_model: z.string().min(10, "Descreva pelo menos 10 caracteres"),
    business_challenges: z.string().min(10, "Descreva pelo menos 10 caracteres"),
    short_term_goals: z.string().min(10, "Descreva pelo menos 10 caracteres"),
    important_kpis: z.string().min(5, "Descreva pelo menos 5 caracteres"),
    additional_context: z.string().optional(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      schema.parse(businessContext);
      onSubmit("business_context", { business_context: businessContext });
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-3">
          <Label htmlFor="business_model">
            Modelo de negócio
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="business_model"
            placeholder="Descreva brevemente o modelo de negócio da sua empresa..."
            value={businessContext.business_model}
            onChange={(e) => handleChange("business_model", e.target.value)}
            className="h-24"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="business_challenges">
            Principais desafios
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="business_challenges"
            placeholder="Quais são os principais desafios que sua empresa enfrenta atualmente?"
            value={businessContext.business_challenges}
            onChange={(e) => handleChange("business_challenges", e.target.value)}
            className="h-24"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="short_term_goals">
            Objetivos de curto prazo
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="short_term_goals"
            placeholder="Quais objetivos sua empresa deseja alcançar nos próximos 3-6 meses?"
            value={businessContext.short_term_goals}
            onChange={(e) => handleChange("short_term_goals", e.target.value)}
            className="h-24"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="important_kpis">
            KPIs importantes
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="important_kpis"
            placeholder="Quais métricas são mais importantes para seu negócio?"
            value={businessContext.important_kpis}
            onChange={(e) => handleChange("important_kpis", e.target.value)}
            className="h-24"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="additional_context">
            Contexto adicional (opcional)
          </Label>
          <Textarea
            id="additional_context"
            placeholder="Algo mais que queira compartilhar sobre seu contexto de negócio..."
            value={businessContext.additional_context}
            onChange={(e) => handleChange("additional_context", e.target.value)}
            className="h-24"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Continuar"}
        </Button>
      </form>
    </div>
  );
};
