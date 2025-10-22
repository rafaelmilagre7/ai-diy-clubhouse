import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../schemas/aulaFormSchema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button";
import { Save, HelpCircle, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EtapaPublicacaoProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
  onSubmit: () => Promise<void>;
}

const EtapaPublicacao: React.FC<EtapaPublicacaoProps> = ({ 
  form, 
  onPrevious, 
  isSaving,
  onSubmit
}) => {
  const { watch, setValue, formState: { errors } } = form;
  const aiAssistantEnabled = watch("aiAssistantEnabled");
  const published = watch("published");
  const assistantId = watch("aiAssistantId");
  
  const [saving, setSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  
  // Funções para manipular o estado dos switches
  const handleAiAssistantToggle = (checked: boolean) => {
    setValue("aiAssistantEnabled", checked);
  };
  
  const handlePublishedToggle = (checked: boolean) => {
    setValue("published", checked);
  };
  
  const handleSubmit = async () => {
    try {
      setSaving(true);
      setSaveStatus("saving");
      setErrorMessage(null);
      
      await onSubmit();
      
      setSaveStatus("success");
    } catch (error: any) {
      console.error("Erro ao salvar aula:", error);
      setSaveStatus("error");
      setErrorMessage(error.message || "Ocorreu um erro desconhecido ao salvar a aula.");
    } finally {
      setSaving(false);
    }
  };

  // Validação simples do formato do ID do assistente
  const isValidAssistantId = (id: string) => {
    return id.startsWith('asst_') || id === '';
  };
  
  const assistantIdError = assistantId && !isValidAssistantId(assistantId);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Configurações de Publicação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Label htmlFor="published" className="text-base font-medium">Publicar aula</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground ml-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Quando publicada, a aula ficará visível para os alunos.
                          Você ainda poderá fazer alterações depois.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                  {published ? "A aula será visível para os alunos" : "A aula ficará em modo rascunho"}
                </p>
              </div>
              <Switch 
                id="published" 
                checked={published}
                onCheckedChange={handlePublishedToggle}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Label htmlFor="aiAssistantEnabled" className="text-base font-medium">Habilitar assistente IA</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground ml-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Quando habilitado, um assistente baseado em IA estará disponível 
                          para os alunos responderem dúvidas sobre esta aula.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                  {aiAssistantEnabled ? 
                    "Os alunos poderão fazer perguntas sobre a aula" : 
                    "O assistente IA não estará disponível para esta aula"}
                </p>
              </div>
              <Switch 
                id="aiAssistantEnabled" 
                checked={aiAssistantEnabled}
                onCheckedChange={handleAiAssistantToggle}
              />
            </div>
            
            {aiAssistantEnabled && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="aiAssistantId" className="text-sm font-medium">
                      ID do Assistente OpenAI
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Digite o ID do assistente da OpenAI no formato "asst_..." 
                            Encontre seus assistentes no painel da OpenAI.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input 
                    id="aiAssistantId"
                    placeholder="asst_c8XCKluizadapql5aRAS3lWY"
                    value={form.watch("aiAssistantId") || ""}
                    onChange={(e) => form.setValue("aiAssistantId", e.target.value)}
                    className={assistantIdError ? "border-destructive" : ""}
                  />
                  {assistantIdError && (
                    <p className="text-xs text-destructive">
                      ID do assistente inválido. Deve começar com "asst_"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    ID do assistente criado no painel da OpenAI. Deixe em branco para usar o assistente padrão.
                  </p>
                </div>
                
                <Alert className="bg-status-warning/10 border-status-warning/30 text-status-warning">
                  <AlertCircle className="h-4 w-4 text-status-warning" />
                  <AlertDescription>
                    Para usar esta funcionalidade, você deve ter criado um assistente no painel da OpenAI e configurado a chave da API nas configurações.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {saveStatus === "error" && (
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          <p className="font-medium">Erro ao salvar aula</p>
          <p className="text-sm">{errorMessage || "Ocorreu um erro ao tentar salvar a aula. Por favor, tente novamente."}</p>
        </div>
      )}

      {saveStatus === "success" && (
        <div className="bg-operational/10 p-4 rounded-md text-operational flex items-start space-x-2">
          <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p>Aula salva com sucesso! O diálogo será fechado em breve.</p>
        </div>
      )}
      
      <div className="flex justify-between pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          disabled={isSaving || saving}
        >
          Voltar
        </Button>
        <Button 
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || saving || saveStatus === "success" || assistantIdError}
          className="min-w-button"
        >
          {(isSaving || saving) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : saveStatus === "success" ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Salvo!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Aula
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EtapaPublicacao;
