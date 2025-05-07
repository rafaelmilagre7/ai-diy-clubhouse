
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../AulaStepWizard";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface EtapaConteudoProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
}

const EtapaConteudo: React.FC<EtapaConteudoProps> = ({
  form,
  onNext,
  onPrevious,
}) => {
  const handleContinue = async () => {
    const result = await form.trigger(["content"]);
    if (result) {
      onNext();
    }
  };

  return (
    <div className="space-y-6 py-4">
      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Conteúdo da Aula</FormLabel>
            <FormControl>
              <Card className="p-4 min-h-[300px]">
                <Textarea
                  placeholder="Insira o conteúdo detalhado desta aula"
                  className="resize-none h-64"
                  {...field}
                />
              </Card>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Voltar
        </Button>
        <Button type="button" onClick={handleContinue}>
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default EtapaConteudo;
