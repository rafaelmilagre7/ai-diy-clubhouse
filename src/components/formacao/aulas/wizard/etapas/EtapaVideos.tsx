
import React, { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues, AulaVideo } from "../AulaStepWizard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, GripVertical, Plus, Trash2, Video } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { PandaVideoInput } from "@/components/formacao/comum/PandaVideoInput";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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
  const maxVideos = 10; // Aumentando o limite para 10 vídeos
  
  // Função para validar e avançar
  const handleContinue = async () => {
    setValidationError(null);
    
    // Validar se há pelo menos um vídeo
    if (videos.length === 0) {
      setValidationError("Adicione pelo menos um vídeo antes de continuar.");
      return;
    }
    
    // Validar que todos os vídeos têm título e URL
    const incompleteVideos = videos.filter(v => !v.title || !v.url);
    if (incompleteVideos.length > 0) {
      setValidationError(`Há ${incompleteVideos.length} vídeo(s) incompleto(s). Preencha título e adicione o vídeo.`);
      return;
    }
    
    // Validar esta etapa
    const result = await form.trigger(['videos']);
    if (result) {
      toast.success("Vídeos salvos com sucesso!");
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
      type: "panda" // Definindo Panda como padrão
    }], { shouldValidate: true });
    
    toast.info("Novo vídeo adicionado. Complete as informações.");
  };

  const handleRemoveVideo = (index: number) => {
    const videos = form.getValues().videos || [];
    const videoTitle = videos[index]?.title || `Vídeo ${index + 1}`;
    
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    form.setValue("videos", newVideos, { shouldValidate: true });
    setValidationError(null);
    
    toast.info(`"${videoTitle}" foi removido`);
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
    toast.info("Ordem dos vídeos atualizada");
  };

  // Função para manipular vídeos do Panda Video
  const handlePandaVideoChange = (index: number, videoData: any) => {
    if (!videoData) return;
    
    // Atualizar os campos do vídeo
    handleVideoChange(index, "url", videoData.url);
    handleVideoChange(index, "type", videoData.type);
    
    // Se não houver título definido pelo usuário, use o do vídeo
    if (!videos[index]?.title || videos[index]?.title === "") {
      handleVideoChange(index, "title", videoData.title);
    }
    
    // Campos adicionais específicos para vídeos do Panda
    handleVideoChange(index, "video_id", videoData.video_id);
    if (videoData.thumbnail_url) handleVideoChange(index, "thumbnail_url", videoData.thumbnail_url);
    if (videoData.duration_seconds) handleVideoChange(index, "duration_seconds", videoData.duration_seconds);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <FormLabel className="text-base font-semibold">Vídeos da Aula</FormLabel>
            <FormDescription>
              Adicione vídeos para esta aula através do Panda Video.
              {videos.length > 0 && <Badge variant="outline" className="ml-2">{videos.length}/{maxVideos}</Badge>}
            </FormDescription>
          </div>
          <Button
            type="button"
            onClick={handleAddVideo}
            disabled={videos.length >= maxVideos || isSaving}
            className="gap-1"
          >
            <Plus className="w-4 h-4" /> Adicionar Vídeo
          </Button>
        </div>
        
        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}
        
        {videos.length === 0 ? (
          <div className="p-8 border-2 border-dashed rounded-md text-center">
            <Video className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="font-medium">Nenhum vídeo adicionado ainda</p>
            <p className="text-muted-foreground mt-1">
              Clique em "Adicionar Vídeo" para começar a incluir conteúdo na sua aula.
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
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <div 
                                  {...provided.dragHandleProps} 
                                  className="cursor-grab mr-2 p-1"
                                >
                                  <GripVertical className="h-4 w-4 text-gray-500" />
                                </div>
                                <span className="font-semibold">Vídeo {index + 1}</span>
                                {video.video_id && (
                                  <Badge variant="secondary" className="ml-2">
                                    Panda Video
                                  </Badge>
                                )}
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleRemoveVideo(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <FormLabel htmlFor={`video-title-${index}`}>Título do vídeo</FormLabel>
                                <Input
                                  id={`video-title-${index}`}
                                  placeholder="Título do vídeo"
                                  value={video.title || ''}
                                  onChange={(e) => handleVideoChange(index, "title", e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <FormLabel htmlFor={`video-description-${index}`}>Descrição (opcional)</FormLabel>
                                <Textarea
                                  id={`video-description-${index}`}
                                  placeholder="Descrição do vídeo"
                                  value={video.description || ''}
                                  onChange={(e) => handleVideoChange(index, "description", e.target.value)}
                                  className="resize-none h-20"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <FormLabel>Vídeo</FormLabel>
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
