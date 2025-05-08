
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
import { Badge } from "@/components/ui/badge";

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
  const difficultyLevel = form.watch("difficultyLevel");
  
  const dadosObrigatoriosPreenchidos = !!title && !!moduleId;
  
  const handlePublish = () => {
    if (dadosObrigatoriosPreenchidos) {
      onSubmit();
    } else {
      form.trigger();
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch(difficulty) {
      case 'beginner':
        return 'Iniciante';
      case 'intermediate':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return 'Iniciante';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
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
              <span className="text-muted-foreground">Nível de Dificuldade:</span>
              <span className="font-medium">
                {difficultyLevel && (
                  <Badge className={getDifficultyColor(difficultyLevel)}>
                    {getDifficultyLabel(difficultyLevel)}
                  </Badge>
                )}
              </span>
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
