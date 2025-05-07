
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues, AulaMaterial } from "../AulaStepWizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, Trash2, ExternalLink, GripVertical } from "lucide-react";
import { FormLabel, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from "sonner";

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

  const handleAddMaterial = () => {
    if (materials.length >= maxMaterials) {
      toast.info(`Limite máximo de ${maxMaterials} materiais atingido.`);
      return;
    }
    
    const currentMaterials = form.getValues().materials || [];
    form.setValue("materials", [...currentMaterials, {
      id: `material-${Date.now()}`,
      title: "",
      description: "",
      url: "",
      type: "link"
    }]);
  };

  const handleRemoveMaterial = (index: number) => {
    const currentMaterials = form.getValues().materials || [];
    const materialTitle = currentMaterials[index]?.title || `Material ${index + 1}`;
    
    const newMaterials = [...currentMaterials];
    newMaterials.splice(index, 1);
    form.setValue("materials", newMaterials);
    
    toast.info(`"${materialTitle}" foi removido`);
  };

  const handleMaterialChange = (index: number, field: string, value: any) => {
    const newMaterials = [...form.getValues().materials || []];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    form.setValue("materials", newMaterials);
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
              Adicione links, documentos e outros recursos para esta aula.
              {materials.length > 0 && <Badge variant="outline" className="ml-2">{materials.length}/{maxMaterials}</Badge>}
            </FormDescription>
          </div>
          <Button
            type="button"
            onClick={handleAddMaterial}
            disabled={materials.length >= maxMaterials}
            className="gap-1"
          >
            <Plus className="w-4 h-4" /> Adicionar Material
          </Button>
        </div>
        
        {materials.length === 0 ? (
          <div className="p-8 border-2 border-dashed rounded-md text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="font-medium">Nenhum material adicionado ainda</p>
            <p className="text-muted-foreground mt-1">
              Clique em "Adicionar Material" para incluir recursos complementares.
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
                            
                            <div className="space-y-4">
                              <div className="grid gap-2">
                                <FormLabel htmlFor={`material-title-${index}`}>Título do material</FormLabel>
                                <Input
                                  id={`material-title-${index}`}
                                  placeholder="Título do material"
                                  value={material.title || ''}
                                  onChange={(e) => handleMaterialChange(index, "title", e.target.value)}
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <FormLabel htmlFor={`material-description-${index}`}>Descrição (opcional)</FormLabel>
                                <Textarea
                                  id={`material-description-${index}`}
                                  placeholder="Descrição do material"
                                  value={material.description || ''}
                                  onChange={(e) => handleMaterialChange(index, "description", e.target.value)}
                                  className="resize-none h-20"
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <FormLabel htmlFor={`material-url-${index}`}>URL do material</FormLabel>
                                <div className="flex items-center gap-2">
                                  <Input
                                    id={`material-url-${index}`}
                                    placeholder="https://..."
                                    value={material.url || ''}
                                    onChange={(e) => handleMaterialChange(index, "url", e.target.value)}
                                  />
                                  {material.url && (
                                    <Button 
                                      type="button" 
                                      size="icon" 
                                      variant="ghost"
                                      onClick={() => window.open(material.url, '_blank')}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
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
