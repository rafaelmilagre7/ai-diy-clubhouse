
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues, AulaVideo } from "@/components/formacao/aulas/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormLabel, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { PandaVideoInput } from "@/components/formacao/comum/PandaVideoInput";
import { Plus, Video, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { formatVideoDuration } from "@/lib/supabase/videoUtils";

interface EtapaVideosProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving?: boolean;
  standalone?: boolean;
}

const EtapaVideos: React.FC<EtapaVideosProps> = ({
  form,
  onNext,
  onPrevious,
  isSaving = false,
  standalone = false,
}) => {
  const [addingVideo, setAddingVideo] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Acessar a lista de vídeos do formulário
  const videos = form.watch('videos') || [];
  const maxVideos = 10;

  // Manipulador para continuar para a próxima etapa
  const handleContinue = async () => {
    setValidationError(null);
    onNext();
  };

  // Adicionar um novo vídeo
  const handleAddVideo = () => {
    if (videos.length >= maxVideos) {
      toast.info(`Limite máximo de ${maxVideos} vídeos atingido.`);
      return;
    }
    
    setAddingVideo(true);
  };
  
  // Cancelar adição de vídeo
  const handleCancelAdd = () => {
    setAddingVideo(false);
  };

  // Adicionar vídeo selecionado do Panda Video
  const handleSelectVideo = (videoData: any) => {
    const currentVideos = form.getValues().videos || [];
    
    // Criar novo objeto de vídeo
    const newVideo: AulaVideo = {
      id: `video-${Date.now()}`,
      title: videoData.title || "Vídeo sem título",
      description: "",
      url: videoData.url || "",
      type: "panda",
      video_id: videoData.video_id,
      thumbnail_url: videoData.thumbnail_url,
      duration_seconds: videoData.duration_seconds
    };
    
    form.setValue("videos", [...currentVideos, newVideo]);
    setAddingVideo(false);
    
    toast.success("Vídeo adicionado com sucesso!");
  };

  // Remover um vídeo
  const handleRemoveVideo = (index: number) => {
    const currentVideos = form.getValues().videos || [];
    const videoTitle = currentVideos[index]?.title || `Vídeo ${index + 1}`;
    
    const newVideos = [...currentVideos];
    newVideos.splice(index, 1);
    form.setValue("videos", newVideos);
    
    toast.info(`"${videoTitle}" foi removido`);
  };

  // Reordenar vídeos (drag and drop)
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(form.getValues().videos || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    form.setValue("videos", items);
    toast.info("Ordem dos vídeos atualizada");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <FormLabel className="text-base font-semibold">Vídeos da Aula</FormLabel>
            <FormDescription>
              Adicione vídeos a esta aula. Você pode incluir vídeos da biblioteca do Panda Video.
              {videos.length > 0 && <Badge variant="outline" className="ml-2">{videos.length}/{maxVideos}</Badge>}
            </FormDescription>
          </div>
          {!addingVideo && (
            <Button
              type="button"
              onClick={handleAddVideo}
              disabled={videos.length >= maxVideos}
              className="gap-1"
            >
              <Plus className="w-4 h-4" /> Adicionar Vídeo
            </Button>
          )}
        </div>
        
        {validationError && (
          <div className="bg-destructive/20 text-destructive p-3 rounded-md text-sm">
            {validationError}
          </div>
        )}
        
        {addingVideo && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <FormLabel className="text-base font-semibold">Adicionar Vídeo</FormLabel>
              <PandaVideoInput
                onChange={handleSelectVideo}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelAdd}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {!addingVideo && videos.length === 0 ? (
          <div className="p-8 border-2 border-dashed rounded-md text-center">
            <Video className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="font-medium">Nenhum vídeo adicionado ainda</p>
            <p className="text-muted-foreground mt-1">
              Clique em "Adicionar Vídeo" para incluir vídeos à sua aula.
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
                      key={video.id || `video-${index}`} 
                      draggableId={video.id || `video-${index}`} 
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border rounded-md overflow-hidden"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start">
                              <div 
                                {...provided.dragHandleProps} 
                                className="cursor-grab mt-1 mr-2 p-1"
                              >
                                <GripVertical className="h-5 w-5 text-gray-500" />
                              </div>
                              
                              <div className="flex-shrink-0 mr-4">
                                <div className="relative h-20 w-32 bg-gray-100 rounded overflow-hidden">
                                  {video.thumbnail_url ? (
                                    <img
                                      src={video.thumbnail_url}
                                      alt={video.title}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <Video className="h-8 w-8 text-gray-400" />
                                    </div>
                                  )}
                                  {video.duration_seconds && (
                                    <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-xs">
                                      {formatVideoDuration(video.duration_seconds)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold text-sm">{video.title}</p>
                                    {video.description && (
                                      <p className="text-muted-foreground text-sm mt-1">{video.description}</p>
                                    )}
                                  </div>
                                  
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleRemoveVideo(index)}
                                    className="ml-2"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                                
                                <Badge variant="outline" className="mt-2">
                                  {video.type === 'panda' ? 'Panda Video' : 'YouTube'}
                                </Badge>
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

export default EtapaVideos;
