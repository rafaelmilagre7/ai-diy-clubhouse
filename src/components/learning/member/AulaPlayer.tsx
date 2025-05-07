
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PandaVideoPlayer } from '@/components/formacao/comum/PandaVideoPlayer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Material {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: string;
}

interface Video {
  id: string;
  title: string;
  description?: string;
  video_id: string;
  thumbnail_url?: string;
  url: string;
  type: string;
  duration_seconds?: number;
}

interface Aula {
  id: string;
  title: string;
  description?: string;
  videos: Video[];
  materials?: Material[];
}

interface AulaPlayerProps {
  aula: Aula;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const AulaPlayer: React.FC<AulaPlayerProps> = ({ 
  aula, 
  onNext, 
  onPrevious,
  isFirst = false,
  isLast = false
}) => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState('conteudo');

  const hasVideos = aula.videos && aula.videos.length > 0;
  const hasMaterials = aula.materials && aula.materials.length > 0;
  const currentVideo = hasVideos ? aula.videos[activeVideoIndex] : null;

  // Gerenciar progresso do vídeo
  const handleProgress = (videoId: string, progress: number) => {
    setVideoProgress(prev => ({
      ...prev,
      [videoId]: progress
    }));
  };

  // Verificar se o vídeo foi concluído
  const isVideoCompleted = (videoId: string): boolean => {
    return (videoProgress[videoId] || 0) >= 95;
  };

  // Avançar para o próximo vídeo quando o atual terminar
  const handleVideoEnded = () => {
    if (activeVideoIndex < (aula.videos?.length || 0) - 1) {
      setActiveVideoIndex(activeVideoIndex + 1);
    }
  };

  // Navegar para o próximo vídeo
  const goToNextVideo = () => {
    if (activeVideoIndex < (aula.videos?.length || 0) - 1) {
      setActiveVideoIndex(activeVideoIndex + 1);
    } else if (onNext) {
      onNext();
    }
  };

  // Navegar para o vídeo anterior
  const goToPreviousVideo = () => {
    if (activeVideoIndex > 0) {
      setActiveVideoIndex(activeVideoIndex - 1);
    } else if (onPrevious) {
      onPrevious();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          {/* Header do player */}
          <div className="p-4 border-b">
            <h1 className="text-lg font-semibold">{aula.title}</h1>
            {aula.description && (
              <p className="text-sm text-muted-foreground mt-1">{aula.description}</p>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
              {hasMaterials && (
                <TabsTrigger value="materiais">Materiais</TabsTrigger>
              )}
            </TabsList>

            {/* Conteúdo (vídeos) */}
            <TabsContent value="conteudo" className="border-none p-0">
              {hasVideos ? (
                <div>
                  {/* Player de Vídeo */}
                  <div className="border-b">
                    <div className="aspect-video">
                      <PandaVideoPlayer
                        videoId={currentVideo?.video_id || ''}
                        title={currentVideo?.title || 'Vídeo'}
                        onProgress={(progress) => handleProgress(currentVideo?.id || '', progress)}
                        onEnded={handleVideoEnded}
                        autoplay={true}
                      />
                    </div>
                  </div>
                  
                  {/* Navegação e informações do vídeo */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium">
                          {currentVideo?.title || 'Vídeo'}
                        </h3>
                        {currentVideo?.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {currentVideo.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Controles de navegação */}
                    <div className="flex justify-between items-center pt-4">
                      <Button
                        variant="outline"
                        onClick={goToPreviousVideo}
                        disabled={activeVideoIndex === 0 && isFirst}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {activeVideoIndex > 0 ? 'Vídeo anterior' : 'Aula anterior'}
                      </Button>
                      
                      <div className="text-sm text-muted-foreground">
                        Vídeo {activeVideoIndex + 1} de {aula.videos.length}
                      </div>
                      
                      <Button
                        onClick={goToNextVideo}
                        disabled={activeVideoIndex === aula.videos.length - 1 && isLast}
                        className="flex items-center gap-1"
                      >
                        {activeVideoIndex < aula.videos.length - 1 ? 'Próximo vídeo' : 'Próxima aula'}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Lista de vídeos */}
                  <Separator />
                  <div className="p-4">
                    <h4 className="font-medium mb-3">Vídeos da aula</h4>
                    <div className="space-y-2">
                      {aula.videos.map((video, index) => (
                        <div
                          key={video.id}
                          className={`flex items-center p-2 rounded-md cursor-pointer ${
                            index === activeVideoIndex ? 'bg-primary/10' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setActiveVideoIndex(index)}
                        >
                          <div className="relative h-14 w-24 flex-shrink-0 bg-muted rounded overflow-hidden mr-3">
                            {video.thumbnail_url ? (
                              <img
                                src={video.thumbnail_url}
                                alt={video.title}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-grow">
                            <p className={`text-sm ${index === activeVideoIndex ? 'font-medium' : ''}`}>
                              {video.title}
                            </p>
                          </div>
                          
                          {isVideoCompleted(video.id) && (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">Esta aula não possui vídeos disponíveis.</p>
                </div>
              )}
            </TabsContent>

            {/* Materiais */}
            {hasMaterials && (
              <TabsContent value="materiais" className="p-4">
                <h4 className="font-medium mb-4">Materiais complementares</h4>
                <div className="space-y-3">
                  {aula.materials.map((material) => (
                    <Card key={material.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{material.title}</p>
                            {material.description && (
                              <p className="text-sm text-muted-foreground">{material.description}</p>
                            )}
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => window.open(material.url, '_blank')}
                            className="gap-1"
                          >
                            <FileText className="h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AulaPlayer;
