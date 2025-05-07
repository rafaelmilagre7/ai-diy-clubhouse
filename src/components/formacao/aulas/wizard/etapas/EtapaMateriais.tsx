
import React, { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../AulaStepWizard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, GripVertical, Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUpload } from "@/components/formacao/comum/FileUpload";

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
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const resources = form.watch('resources') || [];
  const maxResources = 5;
  
  const handleContinue = async () => {
    setValidationError(null);
    // Validar esta etapa
    const result = await form.trigger(['resources']);
    if (result) {
      onNext();
    }
  };

  const handleResourceChange = (index: number, field: string, value: any) => {
    const newResources = [...form.getValues().resources];
    newResources[index] = { ...newResources[index], [field]: value };
    // Garantir que o recurso tenha um ID único para satisfazer as validações de tipo
    if (field === 'title' && !newResources[index].id) {
      newResources[index].id = `temp-resource-${index}-${Date.now()}`;
    }
    form.setValue("resources", newResources, { shouldValidate: true });
    setValidationError(null);
  };

  const handleAddResource = () => {
    if (resources.length >= maxResources) {
      setValidationError(`Você pode adicionar no máximo ${maxResources} materiais.`);
      return;
    }
    
    const currentResources = form.getValues().resources || [];
    // Adicionar um ID temporário para satisfazer as validações de tipo
    form.setValue("resources", [...currentResources, { 
      id: `temp-resource-${currentResources.length}-${Date.now()}`,
      title: "", 
      description: "", 
      url: "", 
      type: "document"
    }], { shouldValidate: true });
  };

  const handleRemoveResource = (index: number) => {
    const resources = form.getValues().resources || [];
    const newResources = [...resources];
    newResources.splice(index, 1);
    form.setValue("resources", newResources, { shouldValidate: true });
    setValidationError(null);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(form.getValues().resources);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    form.setValue("resources", items, { shouldValidate: true });
  };

  // Função auxiliar para upload de arquivos
  const handleFileUpload = (index: number, url: string, fileType?: string, fileName?: string, fileSize?: number) => {
    handleResourceChange(index, "url", url);
    if (fileType) handleResourceChange(index, "type", fileType);
    if (fileName) handleResourceChange(index, "fileName", fileName);
    if (fileSize) handleResourceChange(index, "fileSize", fileSize);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel className="text-base">Materiais da Aula (máx. {maxResources})</FormLabel>
          <Button
            type="button"
            size="sm"
            onClick={handleAddResource}
            disabled={resources.length >= maxResources}
          >
            <Plus className="w-4 h-4 mr-1" /> Adicionar Material
          </Button>
        </div>
        
        <FormDescription>
          Adicione até {maxResources} materiais para esta aula. Você pode adicionar documentos, links ou outros recursos úteis.
        </FormDescription>
        
        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}
        
        {resources.length === 0 ? (
          <div className="p-8 border-2 border-dashed rounded-md text-center">
            <p className="text-muted-foreground">
              Nenhum material adicionado. Clique em "Adicionar Material" para começar.
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="resources">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef} 
                  className="space-y-4"
                >
                  {resources.map((resource, index) => (
                    <Draggable 
                      key={`resource-${index}`} 
                      draggableId={`resource-${index}`} 
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border rounded-md p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div 
                                {...provided.dragHandleProps} 
                                className="cursor-grab mr-2"
                              >
                                <GripVertical className="h-4 w-4 text-gray-500" />
                              </div>
                              <span className="font-medium">Material {index + 1}</span>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveResource(index)}
                            >
                              Remover
                            </Button>
                          </div>
                          
                          <div className="space-y-4">
                            <Input
                              placeholder="Título do material"
                              value={resource.title || ''}
                              onChange={(e) => handleResourceChange(index, "title", e.target.value)}
                              className="mb-2"
                            />
                            
                            <Textarea
                              placeholder="Descrição do material"
                              value={resource.description || ''}
                              onChange={(e) => handleResourceChange(index, "description", e.target.value)}
                              className="mb-2 resize-none h-20"
                            />
                            
                            <div className="flex items-center gap-2">
                              {resource.url ? (
                                <div className="flex-1 p-3 border rounded-md bg-gray-50">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-sm">
                                        {resource.fileName || "Documento sem nome"}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {resource.fileSize ? `${Math.round(resource.fileSize / 1024)} KB` : ""}
                                      </p>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleResourceChange(index, "url", "")}
                                    >
                                      Remover
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <FileUpload
                                  value={resource.url || ""}
                                  onChange={(url, fileType, fileName, fileSize) => {
                                    handleFileUpload(index, url, fileType, fileName, fileSize);
                                  }}
                                  bucketName="learning_resources"
                                  folderPath={`materiais/${Date.now()}`}
                                />
                              )}
                            </div>
                          </div>
                        </div>
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
          onClick={handleContinue}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default EtapaMateriais;
