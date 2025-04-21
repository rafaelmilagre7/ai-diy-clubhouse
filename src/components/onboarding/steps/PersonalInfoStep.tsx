
import React from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationInputs } from "./inputs/LocationInputs";
import { SocialInputs } from "./inputs/SocialInputs";
import { NavigationButtons } from "../NavigationButtons";

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

  const onFormSubmit = (data: any) => {
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
          <div>
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              className="mt-1"
              {...register("name", { required: "Nome é obrigatório" })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message?.toString()}</p>
            )}
          </div>

          <div>
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
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message?.toString()}</p>
            )}
          </div>
        </div>

        {/* Telefone e Redes Sociais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              className="mt-1"
              {...register("phone", {
                required: "Telefone é obrigatório",
                pattern: {
                  value: /^\(\d{2}\) \d{4,5}-\d{4}$/,
                  message: "Formato: (00) 00000-0000"
                }
              })}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message?.toString()}</p>
            )}
          </div>

          <SocialInputs
            linkedin={initialData?.linkedin || ""}
            instagram={initialData?.instagram || ""}
            onChangeLinkedin={(v) => register("linkedin").onChange({ target: { value: v } })}
            onChangeInstagram={(v) => register("instagram").onChange({ target: { value: v } })}
            disabled={isSubmitting}
            errors={{
              linkedin: errors.linkedin,
              instagram: errors.instagram
            }}
          />
        </div>

        {/* Localização */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-700">Localização</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LocationInputs
              country={initialData?.country || "Brasil"}
              state={initialData?.state || ""}
              city={initialData?.city || ""}
              onChangeCountry={(v) => register("country").onChange({ target: { value: v } })}
              onChangeState={(v) => register("state").onChange({ target: { value: v } })}
              onChangeCity={(v) => register("city").onChange({ target: { value: v } })}
              disabled={isSubmitting}
              errors={{
                state: errors.state,
                city: errors.city
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
