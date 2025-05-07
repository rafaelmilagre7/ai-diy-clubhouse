
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues, AulaMaterial } from "@/components/formacao/aulas/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, Trash2, ExternalLink, GripVertical, Upload } from "lucide-react";
import { FormLabel, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";

interface EtapaMateriaisProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  standalone?: boolean;
}

const EtapaMateriais: React.FC<EtapaMateriaisProps> = ({
  form,
  onNext,
  onPrevious,
  standalone = false,
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const materials = form.watch('materials') || [];
  const maxMaterials = 15;

  const handleContinue = async () => {
    // Materiais são opcionais, então podemos avançar sem validação específica
    onNext();
  };

  const handleUploadComplete = (url: string, fileName: string, fileSize: number) => {
    if (materials.length >= maxMaterials) {
      toast.info(`Limite máximo de ${maxMaterials} materiais atingido.`);
      return;
    }
    
    const currentMaterials = form.getValues().materials || [];
    form.setValue("materials", [...currentMaterials, {
      id: `material-${Date.now()}`,
      title: fileName,
      description: `Tamanho: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
      url: url,
      type: "file"
    }]);

    toast.success(`Material "${fileName}" adicionado com sucesso!`);
  };

  const handleRemoveMaterial = (index: number) => {
    const currentMaterials = form.getValues().materials || [];
    const materialTitle = currentMaterials[index]?.title || `Material ${index + 1}`;
    
    const newMaterials = [...currentMaterials];
    newMaterials.splice(index, 1);
    form.setValue("materials", newMaterials);
    
    toast.info(`"${materialTitle}" foi removido`);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(form.getValues().materials || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    form.setValue("materials", items);
    toast.info("Ordem dos materiais atualizada");
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <FormLabel className="text-base font-semibold">Materiais Complementares</FormLabel>
            <FormDescription>
              Adicione documentos e outros recursos para esta aula.
              {materials.length > 0 && <Badge variant="outline" className="ml-2">{materials.length}/{maxMaterials}</Badge>}
            </FormDescription>
          </div>
        </div>
        
        <Card className="border-2 border-dashed border-[#0ABAB5]/30 hover:border-[#0ABAB5]/50 transition-all">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-[#0ABAB5]" />
                <h3 className="text-lg font-semibold text-[#0ABAB5]">Upload de Materiais</h3>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Faça upload de PDFs, documentos, planilhas e outros materiais de apoio para a aula.
              </p>
              
              <div className="bg-gray-50 p-6 rounded-md">
                <FileUpload
                  bucketName="learning_materials"
                  folder="aulas"
                  onUploadComplete={handleUploadComplete}
                  accept="*"
                  maxSize={25} // 25MB
                  buttonText="Upload de Material"
                  fieldLabel="Selecione um arquivo (até 25MB)"
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                Formatos suportados: PDF, Word, Excel, PowerPoint, imagens e outros arquivos.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {materials.length === 0 ? (
          <div className="p-8 border-2 border-dashed rounded-md text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="font-medium">Nenhum material adicionado ainda</p>
            <p className="text-muted-foreground mt-1">
              Use a opção de upload para adicionar materiais complementares.
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="materials">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef} 
                  className="space-y-4"
                >
                  {materials.map((material, index) => (
                    <Draggable 
                      key={material.id || `material-${index}`} 
                      draggableId={material.id || `material-${index}`} 
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border rounded-md overflow-hidden"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <div 
                                  {...provided.dragHandleProps} 
                                  className="cursor-grab mr-2 p-1"
                                >
                                  <GripVertical className="h-4 w-4 text-gray-500" />
                                </div>
                                <span className="font-semibold">Material {index + 1}</span>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleRemoveMaterial(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{material.title}</p>
                                {material.description && (
                                  <p className="text-sm text-muted-foreground">{material.description}</p>
                                )}
                              </div>
                              
                              {material.url && (
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(material.url, '_blank')}
                                  className="flex items-center gap-1"
                                >
                                  <FileText className="h-4 w-4" />
                                  Visualizar
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {!standalone && (
        <div className="flex justify-between pt-4 border-t">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Voltar
          </Button>
          <Button type="button" onClick={handleContinue}>
            Continuar
          </Button>
        </div>
      )}
    </div>
  );
};

export default EtapaMateriais;
