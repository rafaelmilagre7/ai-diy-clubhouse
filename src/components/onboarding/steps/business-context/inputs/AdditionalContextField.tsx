
import React from "react";
import { Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

interface AdditionalContextFieldProps {
  control: any;
}

export const AdditionalContextField: React.FC<AdditionalContextFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="additional_context"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Contexto adicional (opcional)</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Algo mais que queira compartilhar sobre seu contexto de negócio..."
              className="min-h-[120px]"
              {...field}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
