import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Upload, LinkIcon, Info, RefreshCw } from "lucide-react";
import { VideoUpload } from "./VideoUpload";
import { createStoragePublicPolicy } from "@/lib/supabase/storage";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

interface VideoUploadCardProps {
  onVideoAdded: (videoData: {
    url: string;
    type: string;
    title?: string;
    fileName?: string;
    filePath?: string;
    fileSize?: number;
    duration_seconds?: number;
    thumbnail_url?: string;
  }) => void;
  defaultTitle?: string;
}

export const VideoUploadCard: React.FC<VideoUploadCardProps> = ({ 
  onVideoAdded,
  defaultTitle = "" 
}) => {
  const [activeTab, setActiveTab] = useState<"file" | "youtube">("youtube");
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [bucketStatus, setBucketStatus] = useState<"checking" | "ready" | "error" | "partial">("checking");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const { user, profile } = useAuth();
  
  // Usar useEffect para executar a verificação de buckets
  useEffect(() => {
    checkStorage();
  }, []); // Array de dependências vazio para executar apenas uma vez
  
  const checkStorage = async () => {
    try {
      setBucketStatus("checking");
      
      console.log("Verificando estado dos buckets de armazenamento...");
      const response = await createStoragePublicPolicy("learning_videos");
      
      console.log("Resposta da verificação de buckets:", response);
      
      // Sempre assumir que os buckets estão prontos a menos que haja um erro claro
      setBucketStatus(response.success ? "ready" : "partial");
      
      // Apenas registrar no console qualquer informação adicional
      if (!response.success) {
        console.log("Alguns buckets podem não estar configurados, mas usando fallbacks:", response.message);
      }
    } catch (error) {
      console.error("Erro ao verificar armazenamento:", error);
      // Mesmo com erro, tentamos continuar - marcamos como parcial em vez de erro
      setBucketStatus("partial");
      console.log(`Erro na verificação: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const retryBucketSetup = async () => {
    setIsRetrying(true);
    toast.info("Verificando configuração de armazenamento...");
    
    try {
      await checkStorage();
      toast.success("Verificação concluída");
    } catch (error) {
      console.error("Erro:", error);
      // Não mostramos erro ao usuário, apenas logamos
    } finally {
      setIsRetrying(false);
    }
  };
  
  const handleVideoUploaded = (
    url: string, 
    videoType: string,
    fileName?: string,
    filePath?: string,
    fileSize?: number,
    durationSeconds?: number
  ) => {
    // Criar objeto de vídeo com dados do upload
    const videoData = {
      url,
      type: videoType,
      title: title || fileName || "Vídeo sem título",
      description: description || "",
      fileName,
      filePath,
      fileSize,
      duration_seconds: durationSeconds || 0
    };
    
    // Chamar callback de adição
    onVideoAdded(videoData);
    
    // Limpar os campos após adicionar
    setTitle("");
    setDescription("");
    setYoutubeUrl("");
    
    // Mostrar feedback de sucesso
    toast.success("Vídeo adicionado com sucesso!");
  };
  
  const handleAddYouTubeVideo = async () => {
    if (!youtubeUrl.trim()) {
      toast.error("Por favor, insira a URL do vídeo do YouTube");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Extrair ID do YouTube da URL
      const youtubeRegExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = youtubeUrl.match(youtubeRegExp);
      
      if (!match || match[1].length !== 11) {
        toast.error("URL do YouTube inválida");
        setIsSubmitting(false);
        return;
      }
      
      const videoId = match[1];
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      
      // Criar objeto de vídeo do YouTube
      handleVideoUploaded(
        embedUrl, 
        "youtube", 
        undefined,
        undefined,
        undefined,
        0
      );
      
    } catch (error) {
      console.error("Erro ao adicionar vídeo do YouTube:", error);
      toast.error("Erro ao adicionar vídeo do YouTube");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Verificar se o usuário está autenticado
  const isAuthenticated = !!user;
  const isAdmin = profile?.role === 'admin' || profile?.role === 'formacao';
  
  // Renderizar mensagem de erro de autenticação se necessário
  if (!isAuthenticated) {
    return (
      <Card className="border-2 border-dashed border-red-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-red-500 flex items-center text-xl">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Erro de Autenticação
          </CardTitle>
          <CardDescription className="text-base">
            Você precisa estar autenticado para adicionar vídeos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Sua sessão expirou ou você não tem permissão para esta operação. Tente fazer login novamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Verificar se o usuário tem permissões adequadas
  if (!isAdmin) {
    return (
      <Card className="border-2 border-dashed border-yellow-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-yellow-500 flex items-center text-xl">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Permissão Insuficiente
          </CardTitle>
          <CardDescription className="text-base">
            Você não tem permissões para adicionar vídeos ao sistema
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="border-2 border-dashed border-[#0ABAB5]/30 hover:border-[#0ABAB5]/50 transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#0ABAB5] flex items-center text-xl">
          <Upload className="h-5 w-5 mr-2" />
          Adicionar Vídeo
        </CardTitle>
        <CardDescription className="text-base">
          Adicione vídeos do YouTube ou faça upload de arquivos de vídeo para esta aula
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alertas de status do storage - removidos os alertas de erro para não confundir o usuário */}
        {bucketStatus === "checking" && (
          <Alert>
            <div className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              <AlertDescription>Verificando configuração do armazenamento...</AlertDescription>
            </div>
          </Alert>
        )}
        
        {/* Campos comuns para todos os tipos de vídeo */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="video-title">Título do vídeo</Label>
            <Input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Introdução à Inteligência Artificial"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="video-description">Descrição (opcional)</Label>
            <Input
              id="video-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do conteúdo do vídeo"
              className="mt-1"
            />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "file" | "youtube")} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
            <TabsTrigger value="file">Arquivo de Vídeo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="youtube" className="space-y-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={handleAddYouTubeVideo}
                disabled={!youtubeUrl.trim() || isSubmitting}
                className="whitespace-nowrap"
              >
                {isSubmitting ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Cole a URL de um vídeo do YouTube para adicionar à aula
            </p>
          </TabsContent>
          
          <TabsContent value="file" className="space-y-4">
            <VideoUpload
              value=""
              onChange={handleVideoUploaded}
              videoType="file"
              disabled={false} // Não desabilitamos mais o upload baseado no status do bucket
            />
            <p className="text-sm text-muted-foreground">
              Faça upload de arquivos de vídeo (MP4, WebM, MOV) até 300MB
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
