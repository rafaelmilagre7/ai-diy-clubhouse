
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../AulaStepWizard";
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
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Video as VideoIcon } from "lucide-react";
import { VideoUploadCard } from "@/components/formacao/comum/VideoUploadCard";
import { YoutubeEmbed } from "@/components/common/YoutubeEmbed";
import { getYoutubeVideoId } from "@/lib/supabase/storage";

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
  // Obter os vídeos já adicionados do formulário
  const videos = form.watch('videos') || [];
  
  // Função para adicionar um novo vídeo
  const handleAddVideo = (videoData: {
    url: string;
    type: string;
    title?: string;
    fileName?: string;
    filePath?: string;
    fileSize?: number;
    duration_seconds?: number;
    thumbnail_url?: string;
  }) => {
    // Gerar thumbnail para YouTube, se aplicável
    let thumbnailUrl = videoData.thumbnail_url;
    if (videoData.type === "youtube" && !thumbnailUrl) {
      const youtubeId = getYoutubeVideoId(videoData.url);
      if (youtubeId) {
        thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      }
    }
    
    // Criar objeto de vídeo
    const newVideo = {
      title: videoData.title || "Vídeo sem título",
      url: videoData.url,
      type: videoData.type,
      fileName: videoData.fileName,
      filePath: videoData.filePath,
      fileSize: videoData.fileSize,
      duration_seconds: videoData.duration_seconds || 0,
      thumbnail_url: thumbnailUrl
    };
    
    // Adicionar novo vídeo ao array de vídeos
    const newVideos = [...videos, newVideo];
    form.setValue('videos', newVideos);
  };
  
  // Função para remover um vídeo
  const handleRemoveVideo = (index: number) => {
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    form.setValue('videos', newVideos);
  };

  // Continuar para a próxima etapa
  const handleContinue = async () => {
    const result = await form.trigger(['videos']);
    if (result) {
      onNext();
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="videos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vídeos da Aula</FormLabel>
              <FormDescription className="mb-2">
                Adicione vídeos do YouTube ou faça upload de arquivos de vídeo para esta aula
              </FormDescription>
              <FormControl>
                <div className="space-y-6">
                  {/* Componente de upload de vídeo */}
                  <VideoUploadCard 
                    onVideoAdded={handleAddVideo}
                  />
                  
                  {/* Lista de vídeos já adicionados */}
                  {videos.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">Vídeos adicionados</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {videos.map((video, index) => (
                          <Card key={index} className="overflow-hidden">
                            <CardHeader className="p-3 bg-gray-50 border-b flex items-center justify-between">
                              <CardTitle className="text-sm font-medium">{video.title}</CardTitle>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRemoveVideo(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                              {/* Preview do vídeo baseado no tipo */}
                              {video.type === "youtube" && video.url && (
                                <div className="aspect-video">
                                  {getYoutubeVideoId(video.url) ? (
                                    <YoutubeEmbed youtubeId={getYoutubeVideoId(video.url) || ""} />
                                  ) : (
                                    <div className="flex items-center justify-center h-full bg-muted">
                                      <VideoIcon className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {video.type === "file" && video.url && (
                                <div className="aspect-video bg-black">
                                  <video 
                                    src={video.url} 
                                    controls 
                                    className="w-full h-full" 
                                  />
                                </div>
                              )}
                              
                              {/* Informações do vídeo */}
                              <div className="p-3">
                                <p className="text-xs text-muted-foreground">
                                  {video.type === "youtube" ? "YouTube" : "Arquivo de vídeo"}
                                  {video.fileSize && ` • ${Math.round(video.fileSize / (1024 * 1024))} MB`}
                                  {video.duration_seconds > 0 && ` • ${Math.floor(video.duration_seconds / 60)}:${(video.duration_seconds % 60).toString().padStart(2, '0')}`}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
            disabled={isSaving}
          >
            Continuar
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default EtapaVideos;
