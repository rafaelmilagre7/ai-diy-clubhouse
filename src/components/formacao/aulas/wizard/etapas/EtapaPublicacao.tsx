
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../AulaStepWizard";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface EtapaPublicacaoProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
}

const EtapaPublicacao: React.FC<EtapaPublicacaoProps> = ({
  form,
  onNext,
  onPrevious,
}) => {
  const handleContinue = async () => {
    // Não há campos obrigatórios nesta etapa
    onNext();
  };

  const aiAssistantEnabled = form.watch("aiAssistantEnabled");
  const modulo = form.watch("modulo_id");
  const coverImage = form.watch("coverImageUrl");

  return (
    <div className="space-y-6 py-4">
      <h3 className="text-base font-medium">Configurações de Publicação</h3>
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <FormField
            control={form.control}
            name="aiAssistantEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Assistente de IA
                  </FormLabel>
                  <FormDescription>
                    Ative para incluir assistência de IA para os alunos nesta aula
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {aiAssistantEnabled && (
            <FormField
              control={form.control}
              name="aiAssistantPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt do Assistente</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Instruções para o assistente de IA"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Instruções especiais para o assistente de IA desta aula
                  </FormDescription>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Publicar Aula
                  </FormLabel>
                  <FormDescription>
                    Quando ativado, a aula ficará visível para os alunos
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

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

export default EtapaPublicacao;
