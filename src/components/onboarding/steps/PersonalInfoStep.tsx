
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
import { toast } from "sonner";
import { PhoneInput } from "./inputs/PhoneInput";

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
  const { register, handleSubmit, formState: { errors, touchedFields }, control } = useForm({
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
      ddi: initialData?.ddi || "+55",
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

  const onFormSubmit = async (data: any) => {
    if (!validation.isValid) {
      toast.error("Por favor, corrija os erros antes de continuar");
      return;
    }
    
    try {
      await onSubmit({
        personal_info: {
          ...data
        }
      });
      toast.success("Dados salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar os dados. Tente novamente.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 animate-fade-in">
      <MilagrinhoMessage 
        message="Bem-vindo ao VIVER DE IA Club! Vamos começar coletando algumas informações pessoais para personalizar sua experiência. Não se preocupe, seus dados estão seguros conosco." 
      />
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className={cn(
              "transition-colors",
              errors.name ? "text-red-500" : touchedFields.name ? "text-[#0ABAB5]" : ""
            )}>
              Nome completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              className={cn(
                "transition-all duration-200",
                errors.name ? "border-red-500 focus:border-red-500" : 
                touchedFields.name ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
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
              type={touchedFields.name && !errors.name ? "success" : "error"}
              message={errors.name?.message?.toString()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className={cn(
              "transition-colors",
              errors.email ? "text-red-500" : touchedFields.email ? "text-[#0ABAB5]" : ""
            )}>
              E-mail <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              className={cn(
                "transition-all duration-200",
                errors.email ? "border-red-500 focus:border-red-500" : 
                touchedFields.email ? "border-[#0ABAB5] focus:border-[#0ABAB5]" : ""
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
              type={touchedFields.email && !errors.email ? "success" : "error"}
              message={errors.email?.message?.toString()}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PhoneInput
            value={validation.values.phone}
            onChange={(v) => validation.handleChange("phone", v)}
            onBlur={() => validation.handleBlur("phone")}
            error={validation.touched.phone ? validation.errors.phone : undefined}
            ddi={validation.values.ddi}
            onChangeDDI={(v) => validation.handleChange("ddi", v)}
          />

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
              onChangeCountry={() => {}}
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
