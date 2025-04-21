
import React from "react";
import { Controller, FieldError } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

interface AdditionalContextFieldProps {
  control: any;
  error?: FieldError;
}

export const AdditionalContextField: React.FC<AdditionalContextFieldProps> = ({ control, error }) => {
  return (
    <FormField
      control={control}
      name="additional_context"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Contexto adicional (opcional)</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Algo mais que queira compartilhar sobre seu contexto de negócio..."
              className="min-h-[120px]"
              {...field}
            />
          </FormControl>
          {(fieldState.error || error) && (
            <span className="text-red-500 text-xs">
              {fieldState.error?.message || error?.message}
            </span>
          )}
        </FormItem>
      )}
    />
  );
};
