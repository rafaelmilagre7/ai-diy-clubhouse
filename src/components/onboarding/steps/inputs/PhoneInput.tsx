
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormFeedback } from "@/components/ui/form-feedback";
import { Phone } from "lucide-react";
import { validateBrazilianPhone } from "@/utils/validationUtils";

export const PhoneInput = () => {
  const { register, formState: { errors } } = useFormContext();
  
  return (
    <div className="space-y-2">
      <label htmlFor="phone" className="block text-sm font-medium">
        Telefone
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Phone className="h-4 w-4 text-gray-500" />
        </div>
        <Input
          id="phone"
          type="tel"
          placeholder="(00) 00000-0000"
          className="pl-10"
          {...register("phone", {
            validate: {
              validPhone: (value) => !value || validateBrazilianPhone(value) || "Telefone inválido"
            }
          })}
        />
      </div>
      {errors.phone && (
        <FormFeedback error={errors.phone.message as string} />
      )}
    </div>
  );
};
