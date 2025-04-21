
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

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
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
    }
  });

  const onFormSubmit = (data: any) => {
    // Estruturando os dados para o formato esperado pelo backend
    const formattedData = {
      personal_info: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      }
    };
    
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6 space-y-4">
        <div>
          <Label htmlFor="name" className="text-white">Nome completo</Label>
          <Input
            id="name"
            placeholder="Seu nome completo"
            className="bg-gray-600 border-gray-500 text-white mt-1"
            {...register("name", { required: "Nome é obrigatório" })}
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message?.toString()}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-white">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu.email@exemplo.com"
            className="bg-gray-600 border-gray-500 text-white mt-1"
            {...register("email", {
              required: "E-mail é obrigatório",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Endereço de e-mail inválido"
              }
            })}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email.message?.toString()}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className="text-white">Telefone</Label>
          <Input
            id="phone"
            placeholder="(00) 00000-0000"
            className="bg-gray-600 border-gray-500 text-white mt-1"
            {...register("phone", {
              pattern: {
                value: /^\(\d{2}\) \d{4,5}-\d{4}$/,
                message: "Formato: (00) 00000-0000"
              }
            })}
          />
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">{errors.phone.message?.toString()}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-[#0ABAB5] hover:bg-[#099388] text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Salvando..."
          ) : (
            <span className="flex items-center gap-2">
              Próximo
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};
