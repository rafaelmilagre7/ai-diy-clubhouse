
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { getYoutubeVideoId, getYoutubeThumbnailUrl } from "@/lib/supabase/storage";
import { 
  Film, Link, Loader2, Video, Youtube, AlertCircle, Check, X
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoUploadProps {
  value: string;
  onChange: (
    url: string, 
    videoType: string, 
    fileName?: string, 
    filePath?: string, 
    fileSize?: number,
    duration?: number,
    thumbnailUrl?: string
  ) => void;
  videoType?: string;
  disabled?: boolean;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  value,
  onChange,
  videoType = "youtube",
  disabled = false
}) => {
  const [activeTab, setActiveTab] = useState(videoType || "youtube");
  const [youtubeUrl, setYoutubeUrl] = useState(videoType === "youtube" ? value : "");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Processar URL do YouTube
  const processYoutubeUrl = () => {
    if (!youtubeUrl) {
      setError("Por favor, insira uma URL válida do YouTube");
      return;
    }

    try {
      // Extrair ID do vídeo
      const videoId = getYoutubeVideoId(youtubeUrl);
      if (!videoId) {
        setError("URL do YouTube inválida. Utilize uma URL no formato correto.");
        return;
      }

      // Formatar URL corretamente
      const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      // Gerar URL de thumbnail
      const thumbnailUrl = getYoutubeThumbnailUrl(standardUrl);
      
      // Passa para o componente pai
      onChange(standardUrl, "youtube", undefined, undefined, undefined, 0, thumbnailUrl);
      setError(null);
      toast.success("URL do YouTube adicionada com sucesso");
    } catch (error) {
      setError("Erro ao processar URL do YouTube. Verifique se o formato está correto.");
      console.error("Erro ao processar URL do YouTube:", error);
    }
  };

  // Upload direto de vídeo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    if (!validTypes.includes(file.type)) {
      setError(`Tipo de arquivo não suportado: ${file.type}. Use formatos como MP4, MOV, AVI ou MKV.`);
      return;
    }

    // Validar tamanho (limite de 200MB)
    const maxSize = 200 * 1024 * 1024; // 200MB em bytes
    if (file.size > maxSize) {
      setError(`O arquivo é muito grande (${(file.size / (1024 * 1024)).toFixed(2)}MB). O tamanho máximo é 200MB.`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `videos/${fileName}`;
      
      console.log(`Iniciando upload de vídeo para bucket: ${STORAGE_BUCKETS.LEARNING_VIDEOS}`);
      console.log(`Fazendo upload do arquivo: ${fileName} para ${filePath}`);
      
      // Upload direto - funciona conforme correção dos outros uploads
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.LEARNING_VIDEOS)
        .upload(filePath, file, { 
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error("Erro no upload:", uploadError);
        throw new Error(uploadError.message);
      }

      console.log("Upload de vídeo concluído:", uploadData);

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.LEARNING_VIDEOS)
        .getPublicUrl(filePath);

      console.log("URL pública do vídeo gerada:", urlData.publicUrl);

      if (!urlData.publicUrl) {
        throw new Error("URL pública não foi gerada");
      }
      
      onChange(
        urlData.publicUrl, 
        "direct", 
        file.name, 
        uploadData.path, 
        file.size
      );
      
      toast.success("Vídeo enviado com sucesso");
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      setError(`Erro no upload: ${error.message || "Tente novamente ou use uma URL do YouTube"}`);
      toast.error("Falha no upload do vídeo");
    } finally {
      setUploading(false);
    }
  };

  // Verificar se o vídeo atual está vazio
  const hasValue = !!value;

  // Renderizar preview do vídeo
  const renderVideoPreview = () => {
    if (!hasValue) return null;

    if (videoType === "youtube") {
      const videoId = getYoutubeVideoId(value);
      if (!videoId) return null;

      return (
        <div className="relative pb-[56.25%] h-0">
          <iframe 
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            allowFullScreen
          ></iframe>
        </div>
      );
    } else {
      return (
        <div className="relative rounded-md overflow-hidden bg-black">
          <video 
            controls 
            className="w-full h-auto max-h-[300px]" 
            src={value}
          >
            Seu navegador não suporta a reprodução deste vídeo.
          </video>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      {hasValue ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {videoType === "youtube" ? (
                <Youtube className="h-5 w-5 text-status-error mr-2" />
              ) : (
                <Video className="h-5 w-5 text-operational mr-2" />
              )}
              <span className="text-sm font-medium">
                {videoType === "youtube" ? "Vídeo do YouTube" : "Vídeo Enviado"}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onChange("", "youtube")}
              disabled={disabled}
            >
              <X className="h-4 w-4 mr-1" /> Remover
            </Button>
          </div>
          
          {renderVideoPreview()}
          
          <Alert variant="success" className="bg-operational/10">
            <div className="flex items-start">
              <Check className="h-4 w-4 mt-1 text-operational" />
              <AlertDescription className="ml-2">
                Vídeo adicionado com sucesso
              </AlertDescription>
            </div>
          </Alert>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="youtube" disabled={disabled}>
                  <Youtube className="h-4 w-4 mr-2" /> YouTube
                </TabsTrigger>
                <TabsTrigger value="direct" disabled={disabled}>
                  <Film className="h-4 w-4 mr-2" /> Upload de Arquivo
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="youtube" className="pt-4">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Link className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input 
                        type="url" 
                        placeholder="https://www.youtube.com/watch?v=..." 
                        value={youtubeUrl}
                        onChange={(e) => {
                          setYoutubeUrl(e.target.value);
                          setError(null);
                        }}
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={processYoutubeUrl}
                    >
                      Adicionar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cole uma URL de vídeo do YouTube. Formatos suportados: youtube.com/watch, youtu.be
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="direct" className="pt-4">
                <div className="space-y-4">
                  {uploading ? (
                    <div className="p-6 border border-dashed rounded-md text-center">
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                      <p className="mt-2 font-medium">Enviando vídeo... {uploadProgress}%</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Não saia ou feche esta página durante o upload.
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 border border-dashed rounded-md text-center cursor-pointer"
                         onClick={() => document.getElementById('video-file-input')?.click()}>
                      <Film className="h-8 w-8 mx-auto text-primary" />
                      <p className="mt-2 font-medium">
                        Clique para fazer upload de um vídeo
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Formatos suportados: MP4, MOV, AVI, MKV
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tamanho máximo: 200MB
                      </p>
                      <input
                        id="video-file-input"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
                      />
                      <Button
                        type="button"
                        className="mt-4"
                        onClick={() => document.getElementById('video-file-input')?.click()}
                      >
                        Selecionar Arquivo
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
