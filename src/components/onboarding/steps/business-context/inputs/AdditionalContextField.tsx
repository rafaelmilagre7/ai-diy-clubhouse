
import React from "react";
import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  control: any;
}

export const AdditionalContextField: React.FC<Props> = ({ control }) => (
  <div className="space-y-3">
    <Label htmlFor="additional_context">
      Contexto adicional (opcional)
    </Label>
    <Controller
      name="additional_context"
      control={control}
      render={({ field }) => (
        <Textarea
          id="additional_context"
          placeholder="Algo mais que queira compartilhar sobre seu contexto de negócio..."
          value={field.value}
          onChange={field.onChange}
          className="h-24"
        />
      )}
    />
  </div>
);
