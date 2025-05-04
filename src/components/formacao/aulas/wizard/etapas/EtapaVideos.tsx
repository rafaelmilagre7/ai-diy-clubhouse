
import React, { useState } from "react";
import {
  Form,
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
import { VideoUpload } from "@/components/formacao/comum/VideoUpload";
import { PandaVideoUpload } from "@/components/formacao/comum/PandaVideoUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, GripVertical, Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EtapaVideosProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
}

const EtapaVideos: React.FC<EtapaVideosProps> = ({
  form,
  onNext,
  onPrevious,
  isSaving
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const videos = form.watch('videos') || [];
  const maxVideos = 3;
  
  const handleContinue = async () => {
    setValidationError(null);
    // Validar esta etapa
    const result = await form.trigger(['videos']);
    if (result) {
      onNext();
    }
  };

  const handleVideoChange = (index: number, field: string, value: any) => {
    const newVideos = [...form.getValues().videos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    // Garantir que o vídeo tenha um ID único para satisfazer as validações de tipo
    if (field === 'title' && !newVideos[index].id) {
      newVideos[index].id = `temp-video-${index}-${Date.now()}`;
    }
    form.setValue("videos", newVideos, { shouldValidate: true });
    setValidationError(null);
  };

  const handleAddVideo = () => {
    if (videos.length >= maxVideos) {
      setValidationError(`Você pode adicionar no máximo ${maxVideos} vídeos.`);
      return;
    }
    
    const currentVideos = form.getValues().videos || [];
    // Adicionar um ID temporário para satisfazer as validações de tipo
    form.setValue("videos", [...currentVideos, { 
      id: `temp-video-${currentVideos.length}-${Date.now()}`,
      title: "", 
      description: "", 
      url: "", 
      type: "youtube"
    }], { shouldValidate: true });
  };

  const handleRemoveVideo = (index: number) => {
    const videos = form.getValues().videos || [];
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    form.setValue("videos", newVideos, { shouldValidate: true });
    setValidationError(null);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(form.getValues().videos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    form.setValue("videos", items, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <div className="space-y-6 py-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel className="text-base">Vídeos da Aula (máx. 3)</FormLabel>
            <Button
              type="button"
              size="sm"
              onClick={handleAddVideo}
              disabled={videos.length >= maxVideos}
            >
              <Plus className="w-4 h-4 mr-1" /> Adicionar Vídeo
            </Button>
          </div>
          
          <FormDescription>
            Adicione até 3 vídeos para esta aula. Você pode usar vídeos do YouTube ou fazer upload direto pelo Panda Video.
          </FormDescription>
          
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          
          {videos.length === 0 ? (
            <div className="p-8 border-2 border-dashed rounded-md text-center">
              <p className="text-muted-foreground">
                Nenhum vídeo adicionado. Clique em "Adicionar Vídeo" para começar.
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="videos">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef} 
                    className="space-y-4"
                  >
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
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div 
                                  {...provided.dragHandleProps} 
                                  className="cursor-grab mr-2"
                                >
                                  <GripVertical className="h-4 w-4 text-gray-500" />
                                </div>
                                <span className="font-medium">Vídeo {index + 1}</span>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRemoveVideo(index)}
                              >
                                Remover
                              </Button>
                            </div>
                            
                            <div className="space-y-4">
                              <Input
                                placeholder="Título do vídeo"
                                value={video.title || ''}
                                onChange={(e) => handleVideoChange(index, "title", e.target.value)}
                                className="mb-2"
                              />
                              
                              <Textarea
                                placeholder="Descrição do vídeo"
                                value={video.description || ''}
                                onChange={(e) => handleVideoChange(index, "description", e.target.value)}
                                className="mb-2 resize-none h-20"
                              />
                              
                              <Tabs defaultValue={video.type || "youtube"} onValueChange={(value) => handleVideoChange(index, "type", value)}>
                                <TabsList className="w-full mb-4">
                                  <TabsTrigger value="youtube" className="flex-1">YouTube</TabsTrigger>
                                  <TabsTrigger value="panda" className="flex-1">Upload Direto (Panda)</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="youtube">
                                  <VideoUpload
                                    value={video.url || ""}
                                    videoType="youtube"
                                    onChange={(url, type, fileName, filePath, fileSize, duration_seconds, thumbnail_url) => {
                                      handleVideoChange(index, "url", url);
                                      handleVideoChange(index, "type", "youtube");
                                      handleVideoChange(index, "fileName", fileName);
                                      handleVideoChange(index, "filePath", filePath);
                                      handleVideoChange(index, "fileSize", fileSize);
                                      
                                      if (duration_seconds) {
                                        handleVideoChange(index, "duration_seconds", duration_seconds);
                                      }
                                      
                                      if (thumbnail_url) {
                                        handleVideoChange(index, "thumbnail_url", thumbnail_url);
                                      }
                                    }}
                                  />
                                </TabsContent>
                                
                                <TabsContent value="panda">
                                  <PandaVideoUpload
                                    value={video.url || ""}
                                    videoData={video}
                                    onChange={(url, type, fileName, filePath, fileSize, duration_seconds, thumbnail_url, videoId) => {
                                      handleVideoChange(index, "url", url);
                                      handleVideoChange(index, "type", "panda");
                                      handleVideoChange(index, "fileName", fileName);
                                      handleVideoChange(index, "filePath", filePath);
                                      handleVideoChange(index, "fileSize", fileSize);
                                      handleVideoChange(index, "video_id", videoId);
                                      
                                      if (duration_seconds) {
                                        handleVideoChange(index, "duration_seconds", duration_seconds);
                                      }
                                      
                                      if (thumbnail_url) {
                                        handleVideoChange(index, "thumbnail_url", thumbnail_url);
                                      }
                                    }}
                                  />
                                </TabsContent>
                              </Tabs>
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
    </Form>
  );
};

export default EtapaVideos;
