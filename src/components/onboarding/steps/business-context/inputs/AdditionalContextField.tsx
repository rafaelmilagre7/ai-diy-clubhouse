
import React from "react";
import { Controller, FieldError } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

interface AdditionalContextFieldProps {
  control: any;
  error?: FieldError | any; // Modificado para aceitar qualquer tipo de erro
}

export const AdditionalContextField: React.FC<AdditionalContextFieldProps> = ({ control, error }) => {
  return (
    <div className="space-y-2">
      <Controller
        control={control}
        name="additional_context"
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <FormLabel htmlFor="additional_context">Contexto adicional (opcional)</FormLabel>
            <Textarea
              id="additional_context"
              placeholder="Algo mais que queira compartilhar sobre seu contexto de negócio..."
              className="min-h-[120px]"
              {...field}
            />
            {(fieldState.error || error) && (
              <span className="text-red-500 text-xs">
                {fieldState.error?.message || (error?.message || '')}
              </span>
            )}
          </div>
        )}
      />
    </div>
  );
};
