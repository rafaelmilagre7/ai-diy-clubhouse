
import React from "react";
import {
  Form,
  FormLabel,
  FormDescription,
  FormMessage
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../AulaStepWizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VideoUpload } from "@/components/formacao/comum/VideoUpload";
import { Plus, GripVertical, Trash } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface EtapaVideosProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
}

const EtapaVideos: React.FC<EtapaVideosProps> = ({
  form,
  onNext,
  onPrevious
}) => {
  const handleContinue = async () => {
    // Validar apenas os campos desta etapa
    onNext();
  };
  
  const videos = form.watch('videos') || [];

  // Funções para manipular vídeos
  const handleAddVideo = () => {
    form.setValue('videos', [...videos, { url: '', type: 'youtube' }]);
  };

  const handleRemoveVideo = (index: number) => {
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    form.setValue('videos', newVideos);
  };

  const handleVideoChange = (index: number, field: string, value: any) => {
    const newVideos = [...videos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    form.setValue('videos', newVideos);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(videos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    form.setValue('videos', items);
  };

  return (
    <Form {...form}>
      <div className="space-y-6 py-4">
        <div>
          <FormLabel className="text-lg font-medium">Vídeos da Aula</FormLabel>
          <FormDescription className="mb-4">
            Os vídeos adicionados aqui determinarão automaticamente o tempo total estimado da aula
          </FormDescription>
          <FormMessage />
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="videos">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {videos.length === 0 ? (
                    <div className="text-center p-6 border border-dashed rounded-md">
                      <p className="text-muted-foreground">
                        Nenhum vídeo adicionado. Clique em "Adicionar Vídeo" para começar.
                      </p>
                    </div>
                  ) : (
                    <>
                      {videos.map((video, index) => (
                        <Draggable
                          key={index}
                          draggableId={`video-${index}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="border rounded-md p-4"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                  <div 
                                    {...provided.dragHandleProps} 
                                    className="cursor-grab mr-3"
                                  >
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <h3 className="font-medium">Vídeo {index + 1}</h3>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveVideo(index)}
                                >
                                  <Trash className="h-4 w-4 mr-1" />
                                  Remover
                                </Button>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <FormLabel className="text-sm">Título do Vídeo</FormLabel>
                                  <Input
                                    placeholder="Título do vídeo"
                                    value={video.title || ''}
                                    onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                                    className="mt-1"
                                  />
                                </div>
                                
                                <div>
                                  <FormLabel className="text-sm">Descrição do Vídeo</FormLabel>
                                  <Textarea
                                    placeholder="Descrição do vídeo"
                                    value={video.description || ''}
                                    onChange={(e) => handleVideoChange(index, 'description', e.target.value)}
                                    className="mt-1 resize-none h-20"
                                  />
                                </div>
                                
                                <div>
                                  <FormLabel className="text-sm">URL ou Upload do Vídeo</FormLabel>
                                  <VideoUpload
                                    value={video.url || ""}
                                    videoType={video.type || "youtube"}
                                    onChange={(url, type, fileName, filePath, fileSize) => {
                                      handleVideoChange(index, "url", url);
                                      handleVideoChange(index, "type", type);
                                      handleVideoChange(index, "fileName", fileName);
                                      handleVideoChange(index, "filePath", filePath);
                                      handleVideoChange(index, "fileSize", fileSize);
                                      
                                      // Definir duração padrão para cálculo de tempo (será refinado depois)
                                      if (type === 'youtube') {
                                        handleVideoChange(index, "duration_seconds", 300);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          
          <Button
            type="button"
            variant="outline"
            className="w-full mt-4"
            onClick={handleAddVideo}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Vídeo
          </Button>
        </div>
        
        <div className="flex justify-between pt-4">
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
    </Form>
  );
};

export default EtapaVideos;
