
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../AulaStepWizard";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    const isValid = await form.trigger(['title', 'description', 'difficulty', 'estimated_time', 'objective']);
    
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
      
      <FormField
        control={form.control}
        name="objective"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Objetivo de Aprendizagem</FormLabel>
            <FormControl>
              <Textarea
                placeholder="O que o aluno deve aprender com esta aula?"
                className="resize-none h-20"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Descreva o que os alunos irão aprender com esta aula.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nível de Dificuldade</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível de dificuldade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="medium">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                O nível de conhecimento necessário para acompanhar esta aula.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimated_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tempo Estimado (minutos)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="30"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Tempo estimado para completar esta aula (em minutos).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
