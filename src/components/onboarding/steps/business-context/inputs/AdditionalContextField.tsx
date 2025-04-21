
import React from "react";
import { Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

interface AdditionalContextFieldProps {
  control: any;
  error?: any;
}

export const AdditionalContextField: React.FC<AdditionalContextFieldProps> = ({ control, error }) => {
  return (
    <div className="space-y-2">
      <Controller
        control={control}
        name="additional_context"
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <label htmlFor="additional_context" className="text-sm font-medium">
              Contexto adicional (opcional)
            </label>
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
