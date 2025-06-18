
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SimpleFileUpload } from "@/components/ui/file/SimpleFileUpload";
import { AulaFormValues } from "../schemas/aulaFormSchema";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface EtapaMateriaisProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
}

const EtapaMateriais: React.FC<EtapaMateriaisProps> = ({
  form,
  onNext,
  onPrevious,
  isSaving
}) => {
  const { watch, setValue, getValues } = form;
  const materiais = watch("materiais") || [];

  const adicionarMaterial = () => {
    const novosMateriais = [
      ...materiais,
      {
        title: "",
        description: "",
        url: "",
        type: "document"
      }
    ];
    setValue("materiais", novosMateriais);
  };

  const removerMaterial = (index: number) => {
    const novosMateriais = materiais.filter((_, i) => i !== index);
    setValue("materiais", novosMateriais);
  };

  const atualizarMaterial = (index: number, campo: string, valor: string) => {
    const novosMateriais = [...materiais];
    novosMateriais[index] = {
      ...novosMateriais[index],
      [campo]: valor
    };
    setValue("materiais", novosMateriais);
  };

  const handleUploadComplete = (index: number) => (url: string, fileName: string, fileSize: number) => {
    console.log('Upload concluído:', { url, fileName, fileSize });
    
    // Atualizar o material com a URL e informações do arquivo
    const novosMateriais = [...materiais];
    novosMateriais[index] = {
      ...novosMateriais[index],
      url: url,
      title: novosMateriais[index].title || fileName,
      fileName: fileName,
      fileSize: fileSize
    };
    setValue("materiais", novosMateriais);
    
    toast.success("Material adicionado com sucesso!");
  };

  const handleRemoveFile = (index: number) => {
    const novosMateriais = [...materiais];
    novosMateriais[index] = {
      ...novosMateriais[index],
      url: "",
      fileName: undefined,
      fileSize: undefined
    };
    setValue("materiais", novosMateriais);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Materiais de Apoio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Adicione documentos, links e outros materiais que complementem a aula.
          </p>

          {materiais.map((material, index) => (
            <Card key={index} className="p-4 border-dashed">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">
                    Material {index + 1}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removerMaterial(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`material-title-${index}`}>Título</Label>
                    <Input
                      id={`material-title-${index}`}
                      value={material.title || ""}
                      onChange={(e) => atualizarMaterial(index, "title", e.target.value)}
                      placeholder="Ex: Planilha de exercícios"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`material-type-${index}`}>Tipo</Label>
                    <select
                      id={`material-type-${index}`}
                      value={material.type || "document"}
                      onChange={(e) => atualizarMaterial(index, "type", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="document">Documento</option>
                      <option value="link">Link externo</option>
                      <option value="video">Vídeo</option>
                      <option value="image">Imagem</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`material-description-${index}`}>Descrição</Label>
                  <Textarea
                    id={`material-description-${index}`}
                    value={material.description || ""}
                    onChange={(e) => atualizarMaterial(index, "description", e.target.value)}
                    placeholder="Descreva brevemente este material..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Arquivo ou URL</Label>
                  {material.type === "link" ? (
                    <Input
                      value={material.url || ""}
                      onChange={(e) => atualizarMaterial(index, "url", e.target.value)}
                      placeholder="https://exemplo.com/link"
                      type="url"
                    />
                  ) : (
                    <SimpleFileUpload
                      bucketName="learning_materials"
                      folderPath="lesson-materials"
                      onUploadComplete={handleUploadComplete(index)}
                      acceptedTypes="*/*"
                      maxSizeMB={50}
                      value={material.url}
                      onRemove={() => handleRemoveFile(index)}
                    />
                  )}
                </div>
              </div>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={adicionarMaterial}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Material
          </Button>
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
          Finalizar
        </Button>
      </div>
    </div>
  );
};

export default EtapaMateriais;
