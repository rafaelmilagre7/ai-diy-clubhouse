
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
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface EtapaPublicacaoProps {
  form: UseFormReturn<AulaFormValues>;
  onPrevious: () => void;
  onComplete: (values: AulaFormValues) => void;
  isSaving: boolean;
}

const EtapaPublicacao: React.FC<EtapaPublicacaoProps> = ({
  form,
  onPrevious,
  onComplete,
  isSaving,
}) => {
  const { title, videos } = form.getValues();
  
  const hasRequiredFields = Boolean(
    title && videos && videos.length > 0
  );

  const handleSave = () => {
    form.handleSubmit((values) => {
      onComplete(values);
    })();
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Revisão e Publicação</h2>
        <p className="text-gray-500">
          Revise as informações da aula antes de salvar ou publicar.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start space-x-3">
            {hasRequiredFields ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            )}
            <div>
              <h3 className="font-medium">Validação da Aula</h3>
              <p className="text-sm text-muted-foreground">
                {hasRequiredFields
                  ? "Todos os campos obrigatórios estão preenchidos."
                  : "Alguns campos obrigatórios não estão preenchidos."}
              </p>
              
              <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                <li className={title ? "text-green-600" : "text-red-500"}>
                  Título da aula {title ? "preenchido" : "não preenchido"}
                </li>
                <li className={videos && videos.length > 0 ? "text-green-600" : "text-red-500"}>
                  Vídeos {videos && videos.length > 0 ? `adicionados (${videos.length})` : "não adicionados"}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <FormField
        control={form.control}
        name="is_published"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Publicar Aula</FormLabel>
              <FormDescription>
                Quando publicada, a aula ficará visível para os alunos.
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

      <FormField
        control={form.control}
        name="is_featured"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Destacar Aula</FormLabel>
              <FormDescription>
                Aulas destacadas aparecem em posição privilegiada na plataforma.
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

      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onPrevious} disabled={isSaving}>
          Voltar
        </Button>
        <Button type="button" onClick={handleSave} disabled={isSaving || !hasRequiredFields}>
          {isSaving ? "Salvando..." : "Salvar Aula"}
        </Button>
      </div>
    </div>
  );
};

export default EtapaPublicacao;
