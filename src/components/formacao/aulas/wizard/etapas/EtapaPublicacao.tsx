
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface EtapaPublicacaoProps {
  form: UseFormReturn<AulaFormValues>;
  onComplete: (values: AulaFormValues) => void;
  onPrevious: () => void;
  isSaving: boolean;
  standalone?: boolean;
}

const EtapaPublicacao: React.FC<EtapaPublicacaoProps> = ({
  form,
  onComplete,
  onPrevious,
  isSaving,
  standalone = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const { title, videos } = form.watch();

  // Validação antes de salvar
  const hasValidationErrors = () => {
    // Verificar se tem título
    if (!title || title.trim() === '') {
      setError("A aula precisa ter um título.");
      return true;
    }

    // Reset de erro
    setError(null);
    return false;
  };

  const handleComplete = async () => {
    // Verificar validação
    if (hasValidationErrors()) {
      return;
    }
    
    // Continuar com salvamento - passar os valores do formulário para a função onComplete
    onComplete(form.getValues());
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Revisão e Publicação</h3>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Resumo da aula */}
      <div className="space-y-6 py-4 border-b">
        <h4 className="font-medium">Resumo da Aula</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Título da aula</p>
            <p className="text-sm">{title || "Não definido"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Vídeos</p>
            <p className="text-sm">{videos?.length || 0} vídeo(s)</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Materiais complementares</p>
            <p className="text-sm">{form.watch('materials')?.length || 0} material(is)</p>
          </div>
        </div>
      </div>
      
      <Separator />

      {/* Opções de publicação */}
      <div className="space-y-4">
        <h4 className="font-medium">Opções de Publicação</h4>
        
        <FormField
          control={form.control}
          name="is_published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Publicar aula</FormLabel>
                <FormDescription>
                  Quando ativado, a aula estará visível para os alunos.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="is_featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Destacar aula</FormLabel>
                <FormDescription>
                  Quando ativado, a aula aparecerá como destaque no módulo.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {!standalone && (
        <div className="flex justify-between pt-4 border-t">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Voltar
          </Button>
          <Button 
            type="button" 
            onClick={handleComplete}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Aula"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EtapaPublicacao;
