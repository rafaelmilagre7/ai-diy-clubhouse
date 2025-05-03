
import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../AulaStepWizard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { CheckCircle2, CircleAlert, BookOpen, Video, FileText } from "lucide-react";

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
  const aulaTitle = form.watch('title');
  const videos = form.watch('videos') || [];
  const resources = form.watch('resources') || [];
  
  // Verifica se a aula tem validação mínima para ser publicada
  const hasMinimumContent = aulaTitle && videos.length > 0;
  
  return (
    <Form {...form}>
      <div className="space-y-6 py-4">
        <div className="border rounded-lg p-4 bg-muted/20">
          <h3 className="text-lg font-medium mb-4">Resumo da Aula</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Título da Aula</h4>
              <p className="text-muted-foreground">{aulaTitle || '(Não definido)'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                <div>
                  <p className="font-medium">Módulo</p>
                  <p className="text-muted-foreground text-sm">
                    {form.watch('moduleId') ? 'Selecionado' : 'Não selecionado'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Video className="h-5 w-5 mr-2 text-blue-500" />
                <div>
                  <p className="font-medium">Vídeos</p>
                  <p className="text-muted-foreground text-sm">
                    {videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                <div>
                  <p className="font-medium">Materiais</p>
                  <p className="text-muted-foreground text-sm">
                    {resources.length} {resources.length === 1 ? 'material' : 'materiais'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Status de validação */}
            <div className="mt-4 border-t pt-4">
              {hasMinimumContent ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  <span>A aula possui o conteúdo mínimo necessário para publicação</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-600">
                  <CircleAlert className="h-5 w-5 mr-2" />
                  <span>A aula precisa ter pelo menos um título e um vídeo para ser publicada</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="published"
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
                    disabled={!hasMinimumContent}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="aiAssistantEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Assistente de IA</FormLabel>
                  <FormDescription>
                    Ative para permitir assistência de IA nesta aula
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
          
          {form.watch('aiAssistantEnabled') && (
            <FormField
              control={form.control}
              name="aiAssistantPrompt"
              render={({ field }) => (
                <FormItem className="rounded-lg border p-4">
                  <FormLabel>ID do Assistente de IA</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ID do assistente (ex: asst_abc123)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Insira o ID do assistente criado na plataforma OpenAI
                  </FormDescription>
                </FormItem>
              )}
            />
          )}
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
            onClick={onSubmit}
            disabled={isSaving || !hasMinimumContent}
          >
            {isSaving ? "Salvando..." : "Salvar Aula"}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default EtapaPublicacao;
