
import React from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationInputs } from "./inputs/LocationInputs";
import { SocialInputs } from "./inputs/SocialInputs";
import { NavigationButtons } from "../NavigationButtons";
import { FormFeedback } from "@/components/ui/form-feedback";
import { useFormValidation } from "@/hooks/useFormValidation";

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
    }
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
          validate: (value: string) => /^\(\d{2}\) \d{4,5}-\d{4}$/.test(value),
          message: "Formato: (00) 00000-0000"
        }
      ],
      linkedin: [
        {
          validate: (value: string) => !value || value.includes("linkedin.com"),
          message: "URL do LinkedIn inválida"
        }
      ],
      instagram: [
        {
          validate: (value: string) => !value || value.includes("instagram.com"),
          message: "URL do Instagram inválida"
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
      <div className="space-y-6">
        {/* Campos básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              className="mt-1"
              {...register("name", { required: "Nome é obrigatório" })}
            />
            <FormFeedback error={errors.name?.message?.toString()} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              className="mt-1"
              {...register("email", {
                required: "E-mail é obrigatório",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "E-mail inválido"
                }
              })}
            />
            <FormFeedback error={errors.email?.message?.toString()} />
          </div>
        </div>

        {/* Telefone e Redes Sociais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              className="mt-1"
              value={validation.values.phone}
              onChange={(e) => validation.handleChange("phone", e.target.value)}
              onBlur={() => validation.handleBlur("phone")}
            />
            <FormFeedback 
              error={validation.errors.phone}
              success={validation.touched.phone && !validation.errors.phone}
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

        {/* Localização */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-200">Localização</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LocationInputs
              country={initialData?.country || "Brasil"}
              state={validation.values.state}
              city={validation.values.city}
              onChangeCountry={(v) => {/* Como o país é fixo para Brasil, não fazemos nada aqui */}}
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
