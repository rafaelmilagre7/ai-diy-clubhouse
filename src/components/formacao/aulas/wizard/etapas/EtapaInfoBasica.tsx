
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EtapaInfoBasicaProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
}

const EtapaInfoBasica: React.FC<EtapaInfoBasicaProps> = ({
  form,
  onNext,
}) => {
  const handleContinue = async () => {
    const result = await form.trigger(["title", "description", "difficulty"]);
    if (result) {
      onNext();
    }
  };

  return (
    <div className="space-y-6 py-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título da Aula</FormLabel>
            <FormControl>
              <Input placeholder="Digite o título da aula" {...field} />
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
                placeholder="Digite uma breve descrição da aula" 
                className="resize-none h-20" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="difficulty"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nível de Dificuldade</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível de dificuldade" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="iniciante">Iniciante</SelectItem>
                <SelectItem value="intermediario">Intermediário</SelectItem>
                <SelectItem value="avancado">Avançado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end pt-4 border-t">
        <Button type="button" onClick={handleContinue}>
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default EtapaInfoBasica;
