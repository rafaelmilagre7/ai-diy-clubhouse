
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../AulaStepWizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface EtapaRevisaoProps {
  form: UseFormReturn<AulaFormValues>;
  onPrevious: () => void;
  onSubmit: () => void;
  isSaving: boolean;
}

const EtapaRevisao: React.FC<EtapaRevisaoProps> = ({
  form,
  onPrevious,
  onSubmit,
  isSaving,
}) => {
  const formValues = form.getValues();

  return (
    <div className="space-y-6 py-4">
      <h3 className="text-base font-medium">Revisão da Aula</h3>

      <Card>
        <CardContent className="p-4 space-y-6">
          <div>
            <h4 className="font-medium mb-1">Título</h4>
            <p>{formValues.title}</p>
          </div>

          <div>
            <h4 className="font-medium mb-1">Descrição</h4>
            <p className="text-sm text-muted-foreground">{formValues.description}</p>
          </div>

          <div>
            <h4 className="font-medium mb-1">Conteúdo</h4>
            <div className="text-sm text-muted-foreground max-h-40 overflow-y-auto border p-2 rounded-md">
              {formValues.content || <em>Nenhum conteúdo adicionado</em>}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-1">Vídeos ({formValues.videos?.length || 0})</h4>
            <div className="grid gap-2">
              {formValues.videos && formValues.videos.length > 0 ? (
                formValues.videos.map((video, index) => (
                  <div key={index} className="p-2 border rounded-md">
                    <p className="font-medium">{video.title || `Vídeo ${index + 1}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {video.origin === "youtube" ? "YouTube" : 
                       video.origin === "panda_upload" ? "Upload via Panda Video" : 
                       "Vídeo selecionado do Panda"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum vídeo adicionado</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium">Atividades</h4>
            <p className="text-sm text-muted-foreground">
              {formValues.activities?.length 
                ? `${formValues.activities.length} atividades adicionadas` 
                : "Nenhuma atividade adicionada"}
            </p>
          </div>

          <div>
            <h4 className="font-medium">Materiais</h4>
            <p className="text-sm text-muted-foreground">
              {formValues.resources?.length 
                ? `${formValues.resources.length} materiais adicionados` 
                : "Nenhum material adicionado"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2">
        <Switch
          id="published"
          checked={formValues.published}
          onCheckedChange={(checked) => form.setValue("published", checked)}
        />
        <Label htmlFor="published">Publicar aula após criação</Label>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Voltar
        </Button>
        <Button 
          type="button" 
          onClick={onSubmit}
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Criar Aula"
          )}
        </Button>
      </div>
    </div>
  );
};

export default EtapaRevisao;
