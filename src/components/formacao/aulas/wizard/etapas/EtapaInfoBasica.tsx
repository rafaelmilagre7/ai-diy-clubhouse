
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "@/components/formacao/aulas/types";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EtapaInfoBasicaProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  standalone?: boolean;
}

const EtapaInfoBasica: React.FC<EtapaInfoBasicaProps> = ({
  form,
  onNext,
  standalone = false,
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleContinue = async () => {
    const isValid = await form.trigger(['title', 'description']);
    
    if (isValid) {
      setValidationError(null);
      onNext();
    } else {
      setValidationError("Por favor, preencha todos os campos obrigatórios");
    }
  };

  return (
    <div className="space-y-6">
      {validationError && (
        <div className="bg-destructive/20 text-destructive p-3 rounded-md text-sm">
          {validationError}
        </div>
      )}

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título da Aula</FormLabel>
            <FormControl>
              <Input
                placeholder="Digite o título da aula"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Um título claro e descritivo sobre o conteúdo da aula.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva brevemente o conteúdo da aula"
                className="resize-none h-20"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Uma descrição breve sobre o que será abordado na aula.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {!standalone && (
        <div className="flex justify-end pt-4">
          <Button type="button" onClick={handleContinue}>
            Continuar
          </Button>
        </div>
      )}
    </div>
  );
};

export default EtapaInfoBasica;
