
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SimpleFileUpload } from "@/components/ui/file/SimpleFileUpload";
import { AulaFormValues } from "../schemas/aulaFormSchema";

interface EtapaMidiaProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
}

const EtapaMidia: React.FC<EtapaMidiaProps> = ({
  form,
  onNext,
  onPrevious,
  isSaving
}) => {
  const { watch, setValue } = form;
  const imagemCapa = watch("imagemCapa");

  const handleImageUpload = (url: string, fileName: string, fileSize: number) => {
    console.log('Imagem de capa carregada:', { url, fileName, fileSize });
    setValue("imagemCapa", url);
  };

  const handleRemoveImage = () => {
    setValue("imagemCapa", "");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mídia e Aparência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="imagemCapa">Imagem de Capa</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione uma imagem que represente visualmente o conteúdo da aula.
            </p>
            
            <SimpleFileUpload
              bucketName="learning_materials"
              folderPath="lesson-covers"
              onUploadComplete={handleImageUpload}
              acceptedTypes="image/*"
              maxSizeMB={10}
              value={imagemCapa}
              onRemove={handleRemoveImage}
            />
          </div>

          {imagemCapa && (
            <div className="mt-4">
              <Label>Preview da Imagem</Label>
              <div className="mt-2 border rounded-lg overflow-hidden">
                <img
                  src={imagemCapa}
                  alt="Preview da capa"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    console.error('Erro ao carregar preview da imagem:', imagemCapa);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isSaving}
        >
          Voltar
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={isSaving}
        >
          Avançar
        </Button>
      </div>
    </div>
  );
};

export default EtapaMidia;
