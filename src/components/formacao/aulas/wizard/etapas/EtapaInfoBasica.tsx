
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues, DifficultyLevel } from "../AulaStepWizard";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface EtapaInfoBasicaProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
}

const EtapaInfoBasica: React.FC<EtapaInfoBasicaProps> = ({ form, onNext }) => {
  const handleContinue = async () => {
    const result = await form.trigger(["title", "description", "modulo_id", "difficultyLevel"]);
    if (result) {
      onNext();
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Aula</FormLabel>
              <FormControl>
                <Input placeholder="Insira o título da aula" {...field} />
              </FormControl>
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
                  placeholder="Descreva brevemente o conteúdo desta aula"
                  className="resize-none h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="modulo_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID do Módulo</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="difficultyLevel"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Nível de Dificuldade</FormLabel>
              <FormControl>
                <Card className="p-4">
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="iniciante" id="iniciante" />
                      <Label htmlFor="iniciante">Iniciante</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediario" id="intermediario" />
                      <Label htmlFor="intermediario">Intermediário</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="avancado" id="avancado" />
                      <Label htmlFor="avancado">Avançado</Label>
                    </div>
                  </RadioGroup>
                </Card>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="button" onClick={handleContinue}>
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default EtapaInfoBasica;
