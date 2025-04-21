
import React from "react";
import { Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export interface AdditionalContextFieldProps {
  control: any;
  error?: any;
  onBlur?: () => void;
}

export const AdditionalContextField: React.FC<AdditionalContextFieldProps> = ({ control, error, onBlur }) => {
  return (
    <Controller
      control={control}
      name="additional_context"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel htmlFor="additional_context" className="text-sm font-medium">
            Contexto adicional (opcional)
          </FormLabel>
          <FormDescription>
            Compartilhe mais detalhes sobre seu negócio que possam ser relevantes para implementar soluções de IA.
          </FormDescription>
          <FormControl>
            <Textarea
              id="additional_context"
              placeholder="Algo mais que queira compartilhar sobre seu contexto de negócio..."
              className="min-h-[120px]"
              {...field}
              onBlur={(e) => {
                field.onBlur();
                if (onBlur) onBlur();
              }}
            />
          </FormControl>
          {(fieldState.error || error) && (
            <FormMessage>
              {fieldState.error?.message || (error?.message || '')}
            </FormMessage>
          )}
        </FormItem>
      )}
    />
  );
};
