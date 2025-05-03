
import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../AulaStepWizard";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EtapaPublicacaoProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSaving: boolean;
}

const EtapaPublicacao: React.FC<EtapaPublicacaoProps> = ({
  form,
  onPrevious,
  onSubmit,
  isSaving
}) => {
  const aiAssistantEnabled = form.watch("aiAssistantEnabled");
  const title = form.watch("title");
  const moduleId = form.watch("moduleId");
  const coverImageUrl = form.watch("coverImageUrl");
  
  const dadosObrigatoriosPreenchidos = !!title && !!moduleId;
  
  const handlePublish = () => {
    if (dadosObrigatoriosPreenchidos) {
      onSubmit();
    } else {
      form.trigger();
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6 py-4">
        <Alert variant={dadosObrigatoriosPreenchidos ? "default" : "destructive"}>
          {dadosObrigatoriosPreenchidos ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {dadosObrigatoriosPreenchidos 
              ? "Pronto para publicar!" 
              : "Dados obrigatórios faltando"
            }
          </AlertTitle>
          <AlertDescription>
            {dadosObrigatoriosPreenchidos
              ? "Todos os dados obrigatórios foram preenchidos."
              : "Você precisa preencher todos os campos obrigatórios nas etapas anteriores."
            }
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="aiAssistantEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Assistente de IA</FormLabel>
                  <FormDescription>
                    Habilitar assistente de IA para esta aula?
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
                  <FormLabel>ID do Assistente OpenAI</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: asst_abc123"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Insira o ID do assistente criado no OpenAI Studio (formato: asst_xyz)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between border p-4 rounded-md">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Publicar aula?</FormLabel>
                  <FormDescription>
                    Quando publicada, a aula ficará visível para os alunos
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
        </div>
        
        <div className="space-y-4 mt-6">
          <h3 className="font-medium">Informações da Aula</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Título:</span>
              <span className="font-medium">{title || "Não definido"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Imagem de Capa:</span>
              <span className="font-medium">{coverImageUrl ? "Definida" : "Não definida"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assistente de IA:</span>
              <span className="font-medium">{aiAssistantEnabled ? "Ativado" : "Desativado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">{form.getValues().published ? "Publicado" : "Rascunho"}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPrevious}
          >
            Voltar
          </Button>
          <Button 
            type="button" 
            onClick={handlePublish}
            disabled={isSaving}
            className="px-6"
          >
            {isSaving ? "Salvando..." : "Salvar Aula"}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default EtapaPublicacao;
