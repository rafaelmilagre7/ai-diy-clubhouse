
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, ImagePlus, FileText, Upload, AlertCircle, Save } from "lucide-react";

interface ResourcesFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ResourcesForm = ({ solutionId, onSave, saving }: ResourcesFormProps) => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Recursos e Materiais</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Gerencie vídeos, imagens e arquivos associados a esta solução.
            </p>
            <div className="mt-6">
              {solutionId ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    <Card className="border-dashed border-2 p-6 flex flex-col items-center justify-center text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="font-medium">Enviar Vídeo</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        MP4, WebM (máx. 100MB)
                      </p>
                    </Card>
                    <Card className="border-dashed border-2 p-6 flex flex-col items-center justify-center text-center">
                      <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="font-medium">Enviar Imagem</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, WebP (máx. 5MB)
                      </p>
                    </Card>
                    <Card className="border-dashed border-2 p-6 flex flex-col items-center justify-center text-center">
                      <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="font-medium">Enviar Arquivo</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, XLSX, DOCX (máx. 10MB)
                      </p>
                    </Card>
                  </div>
                  <p className="text-sm text-muted-foreground mt-6">
                    Nenhum recurso adicionado ainda. Envie arquivos para começar.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                  <p className="text-sm">
                    Você precisa salvar a solução primeiro para gerenciar recursos.
                  </p>
                  <Button 
                    type="button"
                    onClick={onSave}
                    className="mt-4"
                    disabled={saving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Solução
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcesForm;
