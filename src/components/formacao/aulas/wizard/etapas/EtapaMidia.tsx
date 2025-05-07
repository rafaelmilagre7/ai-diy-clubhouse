
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
import { Input } from "@/components/ui/input";

interface EtapaMidiaProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
}

const EtapaMidia: React.FC<EtapaMidiaProps> = ({
  form,
  onNext,
  onPrevious,
}) => {
  const handleContinue = async () => {
    const result = await form.trigger(["coverImageUrl"]);
    if (result) {
      onNext();
    }
  };

  return (
    <div className="space-y-6 py-4">
      <FormField
        control={form.control}
        name="coverImageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Imagem de Capa</FormLabel>
            <FormControl>
              <Input 
                placeholder="URL da imagem de capa" 
                {...field} 
              />
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

export default EtapaMidia;
