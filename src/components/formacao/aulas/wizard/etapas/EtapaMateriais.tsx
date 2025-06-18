
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/formacao/common/FileUpload";
import { Plus, Trash2, FileText, CheckCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../schemas/aulaFormSchema";
import { STORAGE_BUCKETS, ACCEPTED_FILE_TYPES } from "@/lib/supabase/config";

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
  isSaving,
}) => {
  const { watch, setValue, formState: { errors } } = form;
  const materials = watch("resources") || [];

  const addMaterial = () => {
    const newMaterial = {
      title: "",
      description: "",
      url: "",
      type: "document",
      fileName: "",
      fileSize: 0,
    };
    setValue("resources", [...materials, newMaterial]);
  };

  const removeMaterial = (index: number) => {
    const updatedMaterials = materials.filter((_, i) => i !== index);
    setValue("resources", updatedMaterials);
  };

  const updateMaterial = (index: number, field: string, value: any) => {
    const updatedMaterials = [...materials];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      [field]: value,
    };
    setValue("resources", updatedMaterials);
  };

  const handleFileUpload = (
    index: number,
    url: string,
    fileType: string | undefined,
    fileSize: number | undefined
  ) => {
    updateMaterial(index, "url", url);
    updateMaterial(index, "type", fileType || "document");
    updateMaterial(index, "fileSize", fileSize || 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Materiais de Apoio</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adicione PDFs, documentos e outros materiais para complementar o aprendizado dos alunos.
        </p>
      </div>

      {materials.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Nenhum material adicionado</p>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Adicione materiais de apoio como PDFs, documentos ou outros arquivos úteis para os alunos.
            </p>
            <Button onClick={addMaterial} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Material
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {materials.map((material, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Material {index + 1}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMaterial(index)}
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`material-title-${index}`}>
                      Título do Material *
                    </Label>
                    <Input
                      id={`material-title-${index}`}
                      value={material.title}
                      onChange={(e) =>
                        updateMaterial(index, "title", e.target.value)
                      }
                      placeholder="Ex: Apostila de Introdução"
                      disabled={isSaving}
                      required
                    />
                    {errors?.resources?.[index]?.title && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.resources[index]?.title?.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor={`material-description-${index}`}>
                      Descrição
                    </Label>
                    <Textarea
                      id={`material-description-${index}`}
                      value={material.description}
                      onChange={(e) =>
                        updateMaterial(index, "description", e.target.value)
                      }
                      placeholder="Descrição opcional do material"
                      disabled={isSaving}
                      rows={2}
                    />
                  </div>
                </div>

                <div>
                  <Label>Upload do Arquivo</Label>
                  <FileUpload
                    value={material.url}
                    onChange={(url, fileType, fileSize) =>
                      handleFileUpload(index, url, fileType, fileSize)
                    }
                    bucketName={STORAGE_BUCKETS.LEARNING_MATERIALS}
                    folderPath="materials"
                    acceptedFileTypes={ACCEPTED_FILE_TYPES.DOCUMENTS}
                  />
                  {errors?.resources?.[index]?.url && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.resources[index]?.url?.message}
                    </p>
                  )}
                </div>

                {/* Indicador de sucesso do upload */}
                {material.url && material.title && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        Material "{material.title}" carregado com sucesso!
                      </p>
                      {material.fileSize && material.fileSize > 0 && (
                        <p className="text-xs text-green-600">
                          Tamanho: {(material.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Mostrar apenas tamanho se não tiver título ainda */}
                {material.fileSize && material.fileSize > 0 && !material.title && (
                  <div className="text-sm text-muted-foreground">
                    Arquivo carregado • Tamanho: {(material.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addMaterial}
            disabled={isSaving}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Mais Material
          </Button>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isSaving}
        >
          Voltar
        </Button>
        <Button type="button" onClick={onNext} disabled={isSaving}>
          Continuar para Publicação
        </Button>
      </div>
    </div>
  );
};

export default EtapaMateriais;
