
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
import { AulaFormValues, AulaVideo } from "../AulaStepWizard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, GripVertical, Plus, Video, Youtube } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { YoutubeVideoInput } from "@/components/formacao/comum/YoutubeVideoInput";
import { PandaVideoInput } from "@/components/formacao/comum/PandaVideoInput";

interface EtapaVideosProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
}

type VideoSourceTab = "youtube" | "panda";

const EtapaVideos: React.FC<EtapaVideosProps> = ({
  form,
  onNext,
  onPrevious,
  isSaving
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const videos = form.watch('videos') || [];
  const maxVideos = 5; // Limite de 5 vídeos
  
  // Função para validar e avançar
  const handleContinue = async () => {
    setValidationError(null);
    // Validar esta etapa
    const result = await form.trigger(['videos']);
    if (result) {
      onNext();
    }
  };

  // Funções para manipular vídeos
  const handleAddVideo = () => {
    if (videos.length >= maxVideos) {
      setValidationError(`Você pode adicionar no máximo ${maxVideos} vídeos.`);
      return;
    }
    
    const currentVideos = form.getValues().videos || [];
    // Adicionar vídeo com ID temporário
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

  // Atualizar campo específico de um vídeo
  const handleVideoChange = (index: number, field: string, value: any) => {
    const newVideos = [...form.getValues().videos || []];
    newVideos[index] = { ...newVideos[index], [field]: value };
    // Garantir que o vídeo tenha um ID único
    if (!newVideos[index].id) {
      newVideos[index].id = `temp-video-${index}-${Date.now()}`;
    }
    form.setValue("videos", newVideos, { shouldValidate: true });
    setValidationError(null);
  };

  // Reordenar vídeos com drag and drop
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(form.getValues().videos || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    form.setValue("videos", items, { shouldValidate: true });
  };

  // Função para manipular YouTube videos
  const handleYoutubeVideoChange = (index: number, url: string) => {
    handleVideoChange(index, "url", url);
    handleVideoChange(index, "type", "youtube");
  };

  // Função para manipular vídeos do Panda Video
  const handlePandaVideoChange = (index: number, videoData: any) => {
    if (!videoData) return;
    
    handleVideoChange(index, "url", videoData.url);
    handleVideoChange(index, "type", videoData.type);
    handleVideoChange(index, "title", videoData.title || form.getValues().videos?.[index]?.title || "");
    
    // Campos adicionais específicos para vídeos do Panda
    if (videoData.type === "panda") {
      handleVideoChange(index, "video_id", videoData.video_id);
      if (videoData.thumbnail_url) handleVideoChange(index, "thumbnail_url", videoData.thumbnail_url);
      if (videoData.duration_seconds) handleVideoChange(index, "duration_seconds", videoData.duration_seconds);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel className="text-base">Vídeos da Aula (máx. {maxVideos})</FormLabel>
          <Button
            type="button"
            size="sm"
            onClick={handleAddVideo}
            disabled={videos.length >= maxVideos || isSaving}
          >
            <Plus className="w-4 h-4 mr-1" /> Adicionar Vídeo
          </Button>
        </div>
        
        <FormDescription>
          Adicione até {maxVideos} vídeos para esta aula através de YouTube ou do Panda Video.
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
                      key={`video-${video.id || index}`} 
                      draggableId={`video-${video.id || index}`} 
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border rounded-md overflow-hidden"
                        >
                          <CardContent className="p-4">
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
                              
                              <Tabs defaultValue={video.type === "panda" ? "panda" : "youtube"}>
                                <TabsList className="grid grid-cols-2 mb-4">
                                  <TabsTrigger value="youtube" className="flex items-center gap-1">
                                    <Youtube className="h-3 w-3" />
                                    <span>YouTube</span>
                                  </TabsTrigger>
                                  <TabsTrigger value="panda" className="flex items-center gap-1">
                                    <Video className="h-3 w-3" />
                                    <span>Panda Video</span>
                                  </TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="youtube" className="space-y-2">
                                  <YoutubeVideoInput 
                                    value={video.url || ''} 
                                    onChange={(url) => handleYoutubeVideoChange(index, url)}
                                    onVideoLoaded={(title) => {
                                      if (!video.title) {
                                        handleVideoChange(index, "title", title);
                                      }
                                    }}
                                  />
                                </TabsContent>
                                
                                <TabsContent value="panda" className="space-y-2">
                                  <PandaVideoInput
                                    onChange={(videoData) => handlePandaVideoChange(index, videoData)} 
                                    initialValue={
                                      video.type === "panda" && video.url ? {
                                        url: video.url,
                                        title: video.title,
                                        video_id: video.video_id,
                                        thumbnail_url: video.thumbnail_url,
                                        duration_seconds: video.duration_seconds
                                      } : undefined
                                    }
                                  />
                                </TabsContent>
                              </Tabs>
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
          onClick={handleContinue}
          disabled={isSaving}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default EtapaVideos;
