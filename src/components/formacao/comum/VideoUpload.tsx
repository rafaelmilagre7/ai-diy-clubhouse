
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Loader2, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

interface VideoUploadProps {
  value: string;
  onChange: (url: string, videoType: string, fileName?: string, filePath?: string, fileSize?: number) => void;
  videoType?: string;
}

export const VideoUpload = ({ 
  value, 
  onChange,
  videoType = "youtube"
}: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState<string>(videoType === "youtube" ? value : "");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Extrair o nome do arquivo do URL para exibição
  useEffect(() => {
    // Se for um vídeo de arquivo e tiver um valor, tenta extrair o nome do arquivo
    if (value && videoType === "file") {
      const pathParts = value.split("/");
      const extractedFileName = pathParts[pathParts.length - 1];
      if (extractedFileName) {
        setFileName(decodeURIComponent(extractedFileName));
      }
    }
  }, [value, videoType]);

  // Verificar se o bucket existe e criar se necessário
  const ensureBucketExists = async () => {
    try {
      console.log("Verificando se o bucket learning_videos existe...");
      
      // Verificar se o bucket existe
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("Erro ao listar buckets:", listError);
        throw listError;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'learning_videos');
      
      if (!bucketExists) {
        console.log("Bucket learning_videos não existe, tentando criar...");
        
        // Tentar criar o bucket
        const { data, error } = await supabase.storage.createBucket('learning_videos', {
          public: true,
          fileSizeLimit: 104857600, // 100MB em bytes
        });
        
        if (error) {
          console.error("Erro ao criar bucket learning_videos:", error);
          return false;
        }
        
        console.log("Bucket learning_videos criado com sucesso!");
      } else {
        console.log("Bucket learning_videos já existe.");
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao verificar/criar bucket:", error);
      return false;
    }
  };

  // Upload de arquivo
  const uploadVideo = async (file: File) => {
    try {
      setError(null);
      setUploading(true);
      setUploadProgress(5);
      
      // Verificar tamanho do arquivo (limite de 100MB para vídeos)
      const MAX_SIZE = 100 * 1024 * 1024; // 100MB em bytes
      if (file.size > MAX_SIZE) {
        toast.error(`O arquivo excede o tamanho máximo de 100MB`);
        setError(`O arquivo excede o tamanho máximo de 100MB`);
        setUploading(false);
        return;
      }
      
      // Verificar se o bucket existe
      const bucketReady = await ensureBucketExists();
      
      if (!bucketReady) {
        toast.error("Não foi possível preparar o armazenamento para vídeos");
        setError("Erro ao preparar armazenamento");
        setUploading(false);
        return;
      }
      
      setUploadProgress(20);
      
      // Gerar nome único para evitar colisões
      const fileExt = file.name.split(".").pop();
      const uniqueFileName = `${uuidv4()}.${fileExt}`;
      const filePath = `videos/${uniqueFileName}`;
      
      console.log("Iniciando upload de vídeo para:", filePath);
      
      // Upload para o bucket de vídeos
      const { data, error } = await supabase.storage
        .from("learning_videos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });
      
      if (error) {
        console.error("Erro no upload para o storage:", error);
        toast.error(`Erro no upload: ${error.message}`);
        setError(`Erro no upload: ${error.message}`);
        throw error;
      }
      
      setUploadProgress(70);
      console.log("Upload bem-sucedido:", data);
      
      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from("learning_videos")
        .getPublicUrl(data.path);
      
      const publicUrl = urlData.publicUrl;
      setFileName(file.name);
      
      setUploadProgress(90);
      console.log("URL pública obtida:", publicUrl);
      console.log("Dados completos:", {
        url: publicUrl,
        type: "file",
        fileName: file.name,
        filePath: data.path,
        fileSize: file.size
      });
      
      // Chamar onChange com todos os dados relevantes
      onChange(publicUrl, "file", file.name, data.path, file.size);
      
      setUploadProgress(100);
      toast.success("Vídeo carregado com sucesso");
    } catch (error: any) {
      console.error("Erro ao fazer upload do vídeo:", error);
      setError(`Erro no upload: ${error.message || 'Tente novamente'}`);
      toast.error(`Erro ao fazer upload do vídeo: ${error.message || 'Tente novamente'}`);
    } finally {
      setUploading(false);
    }
  };

  // Manipular arquivos selecionados no input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    uploadVideo(file);
  };

  // Manipular remoção do arquivo
  const handleRemoveFile = () => {
    onChange("", "youtube");
    setFileName(null);
    setError(null);
  };
  
  // Lidar com entrada de URL do YouTube
  const handleYoutubeUrl = () => {
    if (!urlInput) {
      toast.error("Por favor, insira uma URL do YouTube");
      return;
    }
    
    setError(null);
    
    // Extrair ID do vídeo do YouTube
    try {
      let videoId = "";
      
      if (urlInput.includes("youtube.com/watch")) {
        const url = new URL(urlInput);
        videoId = url.searchParams.get("v") || "";
      } else if (urlInput.includes("youtu.be/")) {
        videoId = urlInput.split("youtu.be/")[1]?.split("?")[0] || "";
      } else if (urlInput.includes("youtube.com/embed/")) {
        videoId = urlInput.split("youtube.com/embed/")[1]?.split("?")[0] || "";
      }
      
      if (!videoId) {
        toast.error("URL do YouTube inválida");
        setError("URL do YouTube inválida");
        return;
      }
      
      // Criar URL de incorporação
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      // Obter URL da thumbnail
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      
      console.log("URL de incorporação do YouTube gerada:", embedUrl);
      console.log("URL da thumbnail:", thumbnailUrl);
      
      // Atualizar com URL de incorporação
      onChange(embedUrl, "youtube", undefined, undefined, undefined);
      
      toast.success("URL do YouTube processada com sucesso");
    } catch (error: any) {
      console.error("Erro ao processar URL do YouTube:", error);
      toast.error("URL inválida. Verifique e tente novamente.");
      setError(`Erro ao processar URL: ${error.message}`);
    }
  };

  // Alternar entre upload de arquivo e URL do YouTube
  const [uploadType, setUploadType] = useState<"file" | "youtube">(videoType === "youtube" ? "youtube" : "file");

  // Efeito para atualizar o tipo de upload quando videoType mudar
  useEffect(() => {
    setUploadType(videoType === "youtube" ? "youtube" : "file");
    if (videoType === "youtube") {
      setUrlInput(value);
    }
  }, [videoType, value]);

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <Button
          type="button"
          variant={uploadType === "youtube" ? "default" : "outline"}
          onClick={() => setUploadType("youtube")}
          className="flex-1"
        >
          Link do YouTube
        </Button>
        <Button
          type="button"
          variant={uploadType === "file" ? "default" : "outline"}
          onClick={() => setUploadType("file")}
          className="flex-1"
        >
          Upload de Arquivo
        </Button>
      </div>

      {uploadType === "youtube" ? (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Cole a URL do vídeo do YouTube aqui"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className={error && error.includes("URL") ? "border-red-500" : ""}
            />
            <Button type="button" onClick={handleYoutubeUrl}>
              Adicionar
            </Button>
          </div>
          
          {error && error.includes("URL") && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          
          {value && videoType === "youtube" && (
            <div className="mt-4 border rounded-md overflow-hidden">
              <iframe
                src={value}
                title="Vídeo do YouTube"
                className="w-full aspect-video"
                allowFullScreen
              />
              <div className="p-2 flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remover
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {!value || videoType !== "file" ? (
            <div className="flex items-center justify-center w-full">
              <label
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                  "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600",
                  error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                )}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <>
                      <Loader2 className="w-8 h-8 mb-3 text-gray-500 animate-spin" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fazendo upload... {uploadProgress}%
                      </p>
                    </>
                  ) : (
                    <>
                      <Video className="w-8 h-8 mb-3 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Clique para upload</span> ou arraste o arquivo
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        MP4, WEBM ou MOV (máx. 100MB)
                      </p>
                    </>
                  )}
                </div>
                <Input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                  accept="video/mp4,video/webm,video/quicktime"
                />
              </label>
            </div>
          ) : (
            <div className="flex items-center p-4 space-x-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
              <Video className="h-10 w-10 flex-shrink-0 text-blue-600" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate dark:text-white">
                  {fileName || "Vídeo carregado"}
                </p>
                <video 
                  src={value} 
                  controls 
                  className="mt-2 w-full rounded"
                  style={{ maxHeight: "200px" }}
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemoveFile}
                disabled={uploading}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remover vídeo</span>
              </Button>
            </div>
          )}
          
          {error && !error.includes("URL") && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};
