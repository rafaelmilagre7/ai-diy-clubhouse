
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { CheckCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export const CurrentPositionField: React.FC = () => {
  const { register, formState: { errors, touchedFields } } = useFormContext();

  return (
    <div className="space-y-2">
      <Label 
        className={cn(
          "transition-colors flex items-center gap-2",
          errors.current_position ? "text-red-500" : 
          touchedFields.current_position ? "text-[#0ABAB5]" : ""
        )}
      >
        <Briefcase className="h-4 w-4" />
        Seu Cargo
        {touchedFields.current_position && !errors.current_position && (
          <CheckCircle className="h-4 w-4 text-[#0ABAB5]" />
        )}
      </Label>
      <Input
        placeholder="Seu cargo atual"
        {...register("current_position", { 
          required: "Cargo é obrigatório",
          minLength: { value: 2, message: "Cargo muito curto" }
          // Removendo validação em tempo real
        })}
        className={cn(
          "transition-all duration-200",
          errors.current_position && errors.current_position.type === "required" ? "border-red-500" : 
          touchedFields.current_position ? "border-[#0ABAB5]" : ""
        )}
      />
      <FormMessage 
        type={touchedFields.current_position && !errors.current_position ? "success" : "error"}
        message={errors.current_position?.message?.toString()}
      />
    </div>
  );
};
