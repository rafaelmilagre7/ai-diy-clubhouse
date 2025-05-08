
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, GripVertical, Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const maxVideos = 5;
  
  const handleContinue = async () => {
    setValidationError(null);
    const result = await form.trigger(['videos']);
    if (result) {
      onNext();
    }
  };

  // Função para extrair informações do iframe do Panda Video
  const extractPandaVideoInfo = (iframeCode: string): {
    videoId: string;
    url: string;
    thumbUrl?: string;
  } | null => {
    try {
      // Extrair o ID do vídeo do código de incorporação (iframe)
      const idMatch = iframeCode.match(/id="panda-(.*?)"/i);
      const srcMatch = iframeCode.match(/src="(.*?)"/i);
      
      if (!idMatch || idMatch.length < 2 || !srcMatch || srcMatch.length < 2) {
        return null;
      }
      
      const videoId = idMatch[1];
      const embedUrl = srcMatch[1];
      
      // Construir URL da thumbnail com base no ID do vídeo (formato padrão do Panda Video)
      const thumbnailUrl = `https://thumbnails-vz-d6ebf577-797.tv.pandavideo.com.br/thumbnails/${videoId}/default.jpg`;
      
      return {
        videoId: videoId,
        url: embedUrl,
        thumbUrl: thumbnailUrl
      };
    } catch (error) {
      console.error("Erro ao extrair informações do iframe:", error);
      return null;
    }
  };

  const handleIframeChange = (index: number, iframeCode: string) => {
    const videoInfo = extractPandaVideoInfo(iframeCode);
    
    if (!videoInfo) {
      setValidationError("O código de incorporação (iframe) do Panda Video parece ser inválido. Verifique se você copiou o código completo.");
      return;
    }
    
    setValidationError(null);
    
    // Atualizar os dados do vídeo com as informações extraídas do iframe
    const newVideos = [...form.getValues().videos];
    newVideos[index] = { 
      ...newVideos[index],
      url: videoInfo.url,
      type: "panda",
      video_id: videoInfo.videoId,
      filePath: videoInfo.videoId,
      thumbnail_url: videoInfo.thumbUrl || "",
      // Armazenar o iframe completo para referência
      embedCode: iframeCode
    };
    
    form.setValue("videos", newVideos, { shouldValidate: true });
  };

  const handleVideoChange = (index: number, field: string, value: any) => {
    const newVideos = [...form.getValues().videos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    
    // Garantir que o vídeo tenha um ID único
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
    form.setValue("videos", [...currentVideos, { 
      id: `temp-video-${currentVideos.length}-${Date.now()}`,
      title: "", 
      description: "", 
      url: "", 
      type: "panda"
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
            <FormLabel className="text-base">Vídeos da Aula (máx. {maxVideos})</FormLabel>
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
            Adicione até {maxVideos} vídeos para esta aula. Cole o código de incorporação (iframe) do Panda Video para cada vídeo.
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
                        key={`video-${index}`} 
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
                              
                              <div className="space-y-2">
                                <FormLabel>Código de Incorporação do Panda Video (iframe)</FormLabel>
                                <Textarea
                                  placeholder="Cole aqui o código iframe do Panda Video"
                                  value={video.embedCode || ''}
                                  onChange={(e) => handleIframeChange(index, e.target.value)}
                                  className="font-mono text-xs h-32 resize-none"
                                />
                                <FormDescription>
                                  Cole o código iframe completo fornecido pelo Panda Video
                                </FormDescription>
                              </div>
                              
                              {video.thumbnail_url && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium mb-1">Preview:</p>
                                  <div className="aspect-video bg-gray-100 rounded-md overflow-hidden relative">
                                    <img 
                                      src={video.thumbnail_url}
                                      alt="Thumbnail do vídeo"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {video.video_id && (
                                <div className="text-xs text-muted-foreground">
                                  ID do vídeo: {video.video_id}
                                </div>
                              )}
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
