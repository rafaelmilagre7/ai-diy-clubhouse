
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PandaVideoUpload } from "@/components/formacao/comum/PandaVideoUpload";
import { PandaVideoSelector } from "@/components/formacao/comum/PandaVideoSelector";

interface EtapaVideosProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
}

type VideoOriginType = "youtube" | "panda_upload" | "panda_select";

const EtapaVideos: React.FC<EtapaVideosProps> = ({
  form,
  onNext,
  onPrevious,
  isSaving
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const videos = form.watch('videos') || [];
  const maxVideos = 5; // Limite de 5 vídeos
  
  const handleContinue = async () => {
    setValidationError(null);
    // Validar esta etapa
    const result = await form.trigger(['videos']);
    if (result) {
      onNext();
    }
  };

  const handleVideoChange = (index: number, field: string, value: any) => {
    const newVideos = [...form.getValues().videos || []];
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
      type: "youtube", // Tipo padrão agora é YouTube
      origin: "youtube" as VideoOriginType // Nova propriedade que indica a origem
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

    const items = Array.from(form.getValues().videos || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    form.setValue("videos", items, { shouldValidate: true });
  };

  const handleChangeVideoOrigin = (index: number, origin: VideoOriginType) => {
    // Limpar valores relacionados ao tipo anterior para evitar dados incorretos
    const currentVideo = { ...form.getValues().videos?.[index] };
    
    const updatedVideo = {
      ...currentVideo,
      origin,
      url: "", // Limpa URL ao mudar de origem
      type: origin === "youtube" ? "youtube" : "panda" // Ajusta o tipo com base na origem
    };
    
    // Atualizar o vídeo no formulário
    const newVideos = [...form.getValues().videos || []];
    newVideos[index] = updatedVideo;
    form.setValue("videos", newVideos, { shouldValidate: true });
  };
  
  // Função para selecionar vídeo existente
  const handleSelectExistingVideo = (index: number, videoData: any) => {
    handleVideoChange(index, "title", videoData.title || "Vídeo sem título");
    handleVideoChange(index, "description", videoData.description || "");
    handleVideoChange(index, "url", videoData.url);
    handleVideoChange(index, "type", "panda");
    handleVideoChange(index, "filePath", videoData.id);
    handleVideoChange(index, "duration_seconds", videoData.duration_seconds || 0);
    handleVideoChange(index, "thumbnail_url", videoData.thumbnail_url || "");
    handleVideoChange(index, "video_id", videoData.id);
  };
  
  // Função para renderizar o componente específico com base na origem do vídeo
  const renderVideoSourceComponent = (video: AulaVideo, index: number) => {
    const origin = video.origin || "youtube";
    
    switch(origin) {
      case "youtube":
        return (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Youtube className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                placeholder="Cole a URL do YouTube (ex: https://youtube.com/watch?v=...)"
                className="pl-10"
                value={video.url || ''}
                onChange={(e) => handleVideoChange(index, "url", e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Formatos suportados: youtube.com/watch, youtu.be
            </p>
            
            {video.url && video.url.includes("youtube") && (
              <div className="mt-4 rounded-md overflow-hidden border">
                <div className="relative pb-[56.25%] h-0">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeVideoId(video.url)}`}
                    title={video.title || "Vídeo do YouTube"}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        );
        
      case "panda_upload":
        return (
          <PandaVideoUpload
            value={video.url || ""}
            videoData={video}
            onChange={(url, type, fileName, filePath, fileSize, duration_seconds, thumbnail_url, videoId) => {
              handleVideoChange(index, "url", url);
              handleVideoChange(index, "type", "panda");
              handleVideoChange(index, "fileName", fileName);
              handleVideoChange(index, "filePath", filePath || videoId);
              handleVideoChange(index, "fileSize", fileSize);
              handleVideoChange(index, "video_id", videoId);
              handleVideoChange(index, "duration_seconds", duration_seconds);
              handleVideoChange(index, "thumbnail_url", thumbnail_url);
            }}
          />
        );
        
      case "panda_select":
        return (
          <PandaVideoSelector 
            onSelect={(videoData) => handleSelectExistingVideo(index, videoData)}
            currentVideoId={video.video_id || video.filePath}
          />
        );
        
      default:
        return <p>Selecione uma origem de vídeo acima</p>;
    }
  };
  
  // Função para extrair ID do YouTube de uma URL
  const getYoutubeVideoId = (url: string): string => {
    if (!url) return '';
    
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : '';
    } catch (error) {
      console.error("Erro ao extrair ID do YouTube:", error);
      return '';
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
            disabled={videos.length >= maxVideos}
          >
            <Plus className="w-4 h-4 mr-1" /> Adicionar Vídeo
          </Button>
        </div>
        
        <FormDescription>
          Adicione até {maxVideos} vídeos para esta aula através de YouTube, upload pelo Panda Video ou seleção de vídeos já existentes.
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
                              
                              <div className="border rounded-md p-4 bg-muted/20">
                                <RadioGroup 
                                  value={video.origin || "youtube"} 
                                  onValueChange={(value) => handleChangeVideoOrigin(index, value as VideoOriginType)}
                                  className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4 mb-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="youtube" id={`youtube-${index}`} />
                                    <Label htmlFor={`youtube-${index}`} className="flex items-center">
                                      <Youtube className="h-4 w-4 mr-1.5" />
                                      YouTube
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="panda_upload" id={`panda-upload-${index}`} />
                                    <Label htmlFor={`panda-upload-${index}`} className="flex items-center">
                                      <Video className="h-4 w-4 mr-1.5" />
                                      Enviar via Panda Video
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="panda_select" id={`panda-select-${index}`} />
                                    <Label htmlFor={`panda-select-${index}`} className="flex items-center">
                                      <Video className="h-4 w-4 mr-1.5" />
                                      Selecionar do Panda
                                    </Label>
                                  </div>
                                </RadioGroup>
                                
                                {/* Componente específico para cada tipo de origem de vídeo */}
                                {renderVideoSourceComponent(video, index)}
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

export default EtapaVideos;
