
import React, { useState, useEffect } from "react";
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
  CardFooter,
} from "@/components/ui/card";
import { Trash2, Video as VideoIcon, AlertCircle, Info } from "lucide-react";
import { VideoUploadCard } from "@/components/formacao/comum/VideoUploadCard";
import { YoutubeEmbed } from "@/components/common/YoutubeEmbed";
import { getYoutubeVideoId, setupLearningStorageBuckets } from "@/lib/supabase/storage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

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
  // Estado para controlar o status dos buckets
  const [bucketStatus, setBucketStatus] = useState<"checking" | "ready" | "error" | "partial">("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Verificar status dos buckets quando o componente montar
  useEffect(() => {
    checkBucketStatus();
  }, []);
  
  const checkBucketStatus = async () => {
    try {
      setBucketStatus("checking");
      const response = await setupLearningStorageBuckets();
      
      if (response.success) {
        setBucketStatus("ready");
      } else if (response.readyBuckets && response.readyBuckets.length > 0) {
        // Verificar se pelo menos alguns buckets estão prontos
        setBucketStatus("partial");
        setErrorMessage(response.message || "Alguns buckets não estão disponíveis");
      } else {
        setBucketStatus("error");
        setErrorMessage(response.message || "Não foi possível configurar os buckets de armazenamento");
      }
    } catch (error) {
      setBucketStatus("error");
      setErrorMessage(`Erro ao verificar armazenamento: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const handleRetryBucketSetup = async () => {
    toast.info("Verificando configuração de armazenamento...");
    await checkBucketStatus();
    
    if (bucketStatus === "ready") {
      toast.success("Armazenamento configurado com sucesso!");
    } else {
      toast.error("Configuração de armazenamento incompleta.");
    }
  };
  
  // Obter os vídeos já adicionados do formulário
  const videos = form.watch('videos') || [];
  
  // Estado para controle do contador de vídeos
  const [videoCount, setVideoCount] = useState(videos.length);
  const MAX_VIDEOS = 3;
  
  // Função para verificar se atingiu o limite de vídeos
  const hasReachedVideoLimit = videoCount >= MAX_VIDEOS;
  
  // Atualizar contador quando a lista de vídeos mudar
  useEffect(() => {
    setVideoCount(videos.length);
  }, [videos.length]);
  
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
    // Verificar limite de vídeos
    if (videos.length >= MAX_VIDEOS) {
      toast.error(`Limite de ${MAX_VIDEOS} vídeos atingido. Remova algum vídeo antes de adicionar outro.`);
      return;
    }
    
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
    setVideoCount(newVideos.length);
    
    toast.success(`Vídeo adicionado (${newVideos.length}/${MAX_VIDEOS})`);
  };
  
  // Função para remover um vídeo
  const handleRemoveVideo = (index: number) => {
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    form.setValue('videos', newVideos);
    setVideoCount(newVideos.length);
    
    toast.info(`Vídeo removido (${newVideos.length}/${MAX_VIDEOS})`);
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
              <div className="flex justify-between items-center">
                <div>
                  <FormLabel className="text-lg font-medium">Vídeos da Aula</FormLabel>
                  <FormDescription className="mb-2">
                    Adicione até 3 vídeos do YouTube ou faça upload de arquivos de vídeo para esta aula
                  </FormDescription>
                </div>
                <div className="bg-muted px-3 py-1 rounded-full text-sm font-medium">
                  {videoCount}/{MAX_VIDEOS} vídeos
                </div>
              </div>
              
              {/* Alertas de status do bucket */}
              {bucketStatus === "checking" && (
                <Alert className="mb-4">
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-r-transparent rounded-full"></div>
                    <AlertDescription>Verificando configuração do armazenamento...</AlertDescription>
                  </div>
                </Alert>
              )}
              
              {bucketStatus === "error" && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <div className="flex-1">
                    <AlertDescription>{errorMessage || "Erro na configuração do armazenamento"}</AlertDescription>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetryBucketSetup}
                        className="flex items-center"
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  </div>
                </Alert>
              )}
              
              {bucketStatus === "partial" && (
                <Alert variant="warning" className="mb-4">
                  <Info className="h-4 w-4 mr-2" />
                  <div className="flex-1">
                    <AlertDescription>
                      {errorMessage || "Configuração parcial do armazenamento. A adição de vídeos por upload pode ser limitada."}
                    </AlertDescription>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetryBucketSetup}
                        className="flex items-center"
                      >
                        Tentar reconfigurar
                      </Button>
                    </div>
                  </div>
                </Alert>
              )}
                
              <FormControl>
                <div className="space-y-6">
                  {/* Componente de upload de vídeo - desativado se atingiu o limite */}
                  {!hasReachedVideoLimit ? (
                    <VideoUploadCard 
                      onVideoAdded={handleAddVideo}
                      defaultTitle=""
                    />
                  ) : (
                    <Alert className="bg-amber-50 border-amber-100">
                      <Info className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-700">
                        Você atingiu o limite máximo de {MAX_VIDEOS} vídeos por aula. 
                        Para adicionar um novo vídeo, remova algum dos existentes.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Lista de vídeos já adicionados */}
                  {videos.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">Vídeos adicionados</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {videos.map((video, index) => (
                          <Card key={index} className="overflow-hidden">
                            <CardHeader className="p-3 bg-gray-50 border-b flex items-center justify-between">
                              <CardTitle className="text-sm font-medium truncate">
                                {video.title || `Vídeo ${index + 1}`}
                              </CardTitle>
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
                            </CardContent>
                            <CardFooter className="p-3 bg-gray-50 border-t">
                              <p className="text-xs text-muted-foreground flex items-center">
                                <VideoIcon className="h-3 w-3 mr-1" />
                                {video.type === "youtube" ? "YouTube" : "Arquivo de vídeo"}
                                {video.fileSize && ` • ${Math.round(video.fileSize / (1024 * 1024))} MB`}
                                {video.duration_seconds > 0 && ` • ${Math.floor(video.duration_seconds / 60)}:${(video.duration_seconds % 60).toString().padStart(2, '0')}`}
                              </p>
                            </CardFooter>
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
