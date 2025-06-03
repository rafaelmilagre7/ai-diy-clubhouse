
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormMessage } from "@/components/ui/form-message";
import { OnboardingStepProps, ProfessionalDataInput } from "@/types/onboarding";

interface ProfessionalDataStepProps extends OnboardingStepProps {
  // Propriedades específicas podem ser adicionadas aqui se necessário
}

const professionalDataSchema = z.object({
  company_name: z.string().min(1, "Nome da empresa é obrigatório"),
  role: z.string().min(1, "Cargo é obrigatório"),
  company_size: z.string().min(1, "Tamanho da empresa é obrigatório"),
  company_sector: z.string().min(1, "Setor da empresa é obrigatório"),
  company_segment: z.string().optional(),
  company_website: z.string().url("URL inválida").optional().or(z.literal("")),
  annual_revenue: z.string().optional(),
  current_position: z.string().optional(),
});

export const ProfessionalDataStep: React.FC<ProfessionalDataStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  isLastStep,
  onComplete,
}) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProfessionalDataInput>({
    resolver: zodResolver(professionalDataSchema),
    defaultValues: {
      company_name: initialData?.business_info?.company_name || "",
      role: initialData?.business_info?.role || "",
      company_size: initialData?.business_info?.company_size || "",
      company_sector: initialData?.business_info?.company_sector || "",
      company_segment: initialData?.business_info?.company_segment || "",
      company_website: initialData?.business_info?.company_website || "",
      annual_revenue: initialData?.business_info?.annual_revenue || "",
      current_position: initialData?.business_info?.current_position || "",
    },
  });

  const handleFormSubmit = (data: ProfessionalDataInput) => {
    onSubmit?.("business_info", {
      business_info: data
    });
  };

  const companySizeOptions = [
    { value: "1-10", label: "1-10 funcionários" },
    { value: "11-50", label: "11-50 funcionários" },
    { value: "51-200", label: "51-200 funcionários" },
    { value: "201-500", label: "201-500 funcionários" },
    { value: "501-1000", label: "501-1000 funcionários" },
    { value: "1000+", label: "Mais de 1000 funcionários" },
  ];

  const segmentOptions = [
    { value: "tecnologia", label: "Tecnologia" },
    { value: "saude", label: "Saúde" },
    { value: "educacao", label: "Educação" },
    { value: "financeiro", label: "Financeiro" },
    { value: "varejo", label: "Varejo" },
    { value: "industria", label: "Indústria" },
    { value: "servicos", label: "Serviços" },
    { value: "outros", label: "Outros" },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="company_name">Nome da Empresa *</Label>
          <Input
            id="company_name"
            {...register("company_name")}
            placeholder="Nome da sua empresa"
          />
          {errors.company_name && (
            <FormMessage type="error" message={errors.company_name.message} />
          )}
        </div>

        <div>
          <Label htmlFor="role">Seu Cargo *</Label>
          <Input
            id="role"
            {...register("role")}
            placeholder="Ex: CEO, Diretor, Gerente..."
          />
          {errors.role && (
            <FormMessage type="error" message={errors.role.message} />
          )}
        </div>

        <div>
          <Label htmlFor="company_size">Tamanho da Empresa *</Label>
          <Select onValueChange={(value) => setValue("company_size", value)} value={watch("company_size")}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tamanho da empresa" />
            </SelectTrigger>
            <SelectContent>
              {companySizeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.company_size && (
            <FormMessage type="error" message={errors.company_size.message} />
          )}
        </div>

        <div>
          <Label htmlFor="company_sector">Setor da Empresa *</Label>
          <Select onValueChange={(value) => setValue("company_sector", value)} value={watch("company_sector")}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              {segmentOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.company_sector && (
            <FormMessage type="error" message={errors.company_sector.message} />
          )}
        </div>

        <div>
          <Label htmlFor="company_segment">Segmento da Empresa</Label>
          <Select onValueChange={(value) => setValue("company_segment", value)} value={watch("company_segment") || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o segmento" />
            </SelectTrigger>
            <SelectContent>
              {segmentOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.company_segment && (
            <FormMessage type="error" message={errors.company_segment.message} />
          )}
        </div>

        <div>
          <Label htmlFor="company_website">Website da Empresa</Label>
          <Input
            id="company_website"
            {...register("company_website")}
            placeholder="https://www.suaempresa.com"
          />
          {errors.company_website && (
            <FormMessage type="error" message={errors.company_website.message} />
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-viverblue hover:bg-viverblue-dark text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Salvando..." : isLastStep ? "Finalizar" : "Continuar"}
      </Button>
    </form>
  );
};
