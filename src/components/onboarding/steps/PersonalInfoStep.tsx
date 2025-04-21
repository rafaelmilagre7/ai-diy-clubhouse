
import React from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationInputs } from "./inputs/LocationInputs";
import { SocialInputs } from "./inputs/SocialInputs";
import { NavigationButtons } from "../NavigationButtons";
import { FormMessage } from "@/components/ui/form-message";
import { useFormValidation } from "@/hooks/useFormValidation";
import { MilagrinhoMessage } from "../MilagrinhoMessage";
import { cn } from "@/lib/utils";

interface PersonalInfoStepProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete: () => void;
  initialData?: any;
  personalInfo?: any;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData
}) => {
  const { register, handleSubmit, formState: { errors }, control } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      ddi: initialData?.ddi || "+55",
      linkedin: initialData?.linkedin || "",
      instagram: initialData?.instagram || "",
      country: initialData?.country || "Brasil",
      state: initialData?.state || "",
      city: initialData?.city || "",
      timezone: initialData?.timezone || "GMT-3"
    },
    mode: "onChange"
  });

  const validation = useFormValidation(
    {
      phone: initialData?.phone || "",
      linkedin: initialData?.linkedin || "",
      instagram: initialData?.instagram || "",
      state: initialData?.state || "",
      city: initialData?.city || ""
    },
    {
      phone: [
        {
          validate: (value: string) => !value || /^\(\d{2}\) \d{4,5}-\d{4}$/.test(value),
          message: "Digite no formato (00) 00000-0000"
        }
      ],
      linkedin: [
        {
          validate: (value: string) => !value || value.includes("linkedin.com"),
          message: "Insira uma URL válida do LinkedIn"
        }
      ],
      instagram: [
        {
          validate: (value: string) => !value || value.includes("instagram.com"),
          message: "Insira uma URL válida do Instagram"
        }
      ]
    }
  );

  const onFormSubmit = (data: any) => {
    if (!validation.isValid) return;
    onSubmit({
      personal_info: {
        ...data
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <MilagrinhoMessage 
        message="Olá! Para começar, preciso de algumas informações básicas para personalizar sua experiência no VIVER DE IA Club. Vamos lá?" 
      />
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              className={cn(
                "transition-colors",
                errors.name ? "border-red-500 focus:border-red-500" : "focus:border-[#0ABAB5]"
              )}
              {...register("name", { 
                required: "Nome é obrigatório",
                minLength: {
                  value: 3,
                  message: "Nome deve ter pelo menos 3 caracteres"
                }
              })}
            />
            <FormMessage
              type="error"
              message={errors.name?.message?.toString()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              className={cn(
                "transition-colors",
                errors.email ? "border-red-500 focus:border-red-500" : "focus:border-[#0ABAB5]"
              )}
              {...register("email", {
                required: "E-mail é obrigatório",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "E-mail inválido"
                }
              })}
            />
            <FormMessage
              type="error"
              message={errors.email?.message?.toString()}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              className={cn(
                "transition-colors",
                validation.errors.phone ? "border-red-500 focus:border-red-500" : "focus:border-[#0ABAB5]"
              )}
              value={validation.values.phone}
              onChange={(e) => validation.handleChange("phone", e.target.value)}
              onBlur={() => validation.handleBlur("phone")}
            />
            <FormMessage
              type={validation.touched.phone && !validation.errors.phone ? "success" : "error"}
              message={validation.touched.phone ? validation.errors.phone : undefined}
            />
          </div>

          <SocialInputs
            linkedin={validation.values.linkedin}
            instagram={validation.values.instagram}
            onChangeLinkedin={(v) => validation.handleChange("linkedin", v)}
            onChangeInstagram={(v) => validation.handleChange("instagram", v)}
            disabled={isSubmitting}
            errors={{
              linkedin: validation.errors.linkedin,
              instagram: validation.errors.instagram
            }}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-200">Localização</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LocationInputs
              country={initialData?.country || "Brasil"}
              state={validation.values.state}
              city={validation.values.city}
              onChangeCountry={(v) => {/* País fixo para Brasil */}}
              onChangeState={(v) => validation.handleChange("state", v)}
              onChangeCity={(v) => validation.handleChange("city", v)}
              disabled={isSubmitting}
              errors={{
                state: validation.errors.state,
                city: validation.errors.city
              }}
            />
          </div>
        </div>
      </div>

      <NavigationButtons 
        isSubmitting={isSubmitting} 
        showPrevious={false}
        submitText="Salvar e Continuar"
        loadingText="Salvando..." 
      />
    </form>
  );
};
