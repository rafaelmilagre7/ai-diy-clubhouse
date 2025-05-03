
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
  CardDescription 
} from "@/components/ui/card";
import { Trash2, Plus, Video as VideoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VideoUpload } from "@/components/formacao/comum/VideoUpload";
import { YoutubeEmbed } from "@/components/common/YoutubeEmbed";

interface EtapaVideosProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
}

const EtapaVideos: React.FC<EtapaVideosProps> = ({
  form,
  onNext,
  onPrevious
}) => {
  // Obter os vídeos já adicionados do formulário
  const videos = form.watch('videos') || [];
  
  // Estado para controlar o vídeo sendo editado
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Estados para o novo vídeo
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoType, setNewVideoType] = useState<"youtube" | "file">("youtube");
  const [newVideoFileName, setNewVideoFileName] = useState<string | undefined>();
  const [newVideoFilePath, setNewVideoFilePath] = useState<string | undefined>();
  const [newVideoFileSize, setNewVideoFileSize] = useState<number | undefined>();
  
  // Função para adicionar um novo vídeo
  const handleAddVideo = () => {
    if (!newVideoUrl || !newVideoTitle.trim()) return;
    
    const newVideos = [...videos];
    newVideos.push({
      title: newVideoTitle,
      url: newVideoUrl,
      type: newVideoType,
      fileName: newVideoFileName,
      filePath: newVideoFilePath,
      fileSize: newVideoFileSize,
      duration_seconds: 0
    });
    
    form.setValue('videos', newVideos);
    resetNewVideoForm();
    setIsAdding(false);
  };
  
  // Função para remover um vídeo
  const handleRemoveVideo = (index: number) => {
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    
    form.setValue('videos', newVideos);
  };
  
  // Função para editar um vídeo existente
  const handleUpdateVideo = (index: number) => {
    if (!newVideoUrl || !newVideoTitle.trim()) return;
    
    const newVideos = [...videos];
    newVideos[index] = {
      ...newVideos[index],
      title: newVideoTitle,
      url: newVideoUrl,
      type: newVideoType,
      fileName: newVideoFileName,
      filePath: newVideoFilePath,
      fileSize: newVideoFileSize
    };
    
    form.setValue('videos', newVideos);
    resetNewVideoForm();
    setEditingVideoIndex(null);
  };
  
  // Função para iniciar a edição de um vídeo
  const startEditingVideo = (index: number) => {
    const video = videos[index];
    setNewVideoTitle(video.title || '');
    setNewVideoUrl(video.url || '');
    setNewVideoType(video.type as "youtube" | "file" || "youtube");
    setNewVideoFileName(video.fileName);
    setNewVideoFilePath(video.filePath);
    setNewVideoFileSize(video.fileSize);
    setEditingVideoIndex(index);
    setIsAdding(false);
  };
  
  // Resetar o formulário de novo vídeo
  const resetNewVideoForm = () => {
    setNewVideoTitle("");
    setNewVideoUrl("");
    setNewVideoType("youtube");
    setNewVideoFileName(undefined);
    setNewVideoFilePath(undefined);
    setNewVideoFileSize(undefined);
  };
  
  // Função chamada quando o componente VideoUpload muda
  const handleVideoUrlChange = (
    url: string, 
    type: string, 
    fileName?: string, 
    filePath?: string, 
    fileSize?: number
  ) => {
    setNewVideoUrl(url);
    setNewVideoType(type as "youtube" | "file");
    setNewVideoFileName(fileName);
    setNewVideoFilePath(filePath);
    setNewVideoFileSize(fileSize);
  };
  
  // Cancelar adição ou edição
  const handleCancel = () => {
    resetNewVideoForm();
    setEditingVideoIndex(null);
    setIsAdding(false);
  };
  
  // Extrair ID do YouTube de uma URL
  const extractYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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
                <div className="space-y-4">
                  {/* Lista de vídeos já adicionados */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.map((video, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-0">
                          {/* Preview do vídeo baseado no tipo */}
                          {video.type === "youtube" && video.url && (
                            <div className="aspect-video">
                              {extractYoutubeId(video.url) ? (
                                <YoutubeEmbed youtubeId={extractYoutubeId(video.url) || ""} />
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
                          <div className="p-4">
                            <h4 className="font-medium">{video.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {video.type === "youtube" ? "YouTube" : "Arquivo de vídeo"}
                              {video.fileSize && ` • ${Math.round(video.fileSize / (1024 * 1024))} MB`}
                            </p>
                            
                            <div className="flex justify-between mt-4">
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => startEditingVideo(index)}
                              >
                                Editar
                              </Button>
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRemoveVideo(index)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Remover
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Formulário para adicionar/editar vídeo */}
                  {(isAdding || editingVideoIndex !== null) ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>{editingVideoIndex !== null ? "Editar Vídeo" : "Adicionar Novo Vídeo"}</CardTitle>
                        <CardDescription>
                          {editingVideoIndex !== null 
                            ? "Edite as informações do vídeo selecionado" 
                            : "Adicione um vídeo do YouTube ou faça upload de um arquivo de vídeo"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Título do Vídeo</label>
                          <Input
                            placeholder="Digite o título do vídeo"
                            value={newVideoTitle}
                            onChange={(e) => setNewVideoTitle(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">URL do Vídeo</label>
                          <VideoUpload 
                            value={newVideoUrl}
                            onChange={handleVideoUrlChange}
                            videoType={newVideoType}
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={handleCancel}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            type="button"
                            onClick={() => editingVideoIndex !== null ? handleUpdateVideo(editingVideoIndex) : handleAddVideo()}
                            disabled={!newVideoUrl || !newVideoTitle.trim()}
                          >
                            {editingVideoIndex !== null ? "Atualizar" : "Adicionar"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setIsAdding(true);
                        resetNewVideoForm();
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Adicionar Vídeo
                    </Button>
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
          >
            Continuar
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default EtapaVideos;
