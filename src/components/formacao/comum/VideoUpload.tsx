
import { useState } from "react";
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

  // Upload de arquivo
  const uploadVideo = async (file: File) => {
    try {
      setUploading(true);
      
      // Verificar tamanho do arquivo (limite de 100MB para vídeos)
      const MAX_SIZE = 100 * 1024 * 1024; // 100MB em bytes
      if (file.size > MAX_SIZE) {
        toast.error(`O arquivo excede o tamanho máximo de 100MB`);
        setUploading(false);
        return;
      }
      
      // Gerar nome único
      const fileExt = file.name.split(".").pop();
      const uniqueFileName = `${uuidv4()}.${fileExt}`;
      const filePath = `videos/${uniqueFileName}`;
      
      // Upload para o bucket de vídeos
      const { data, error } = await supabase.storage
        .from("learning_videos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });
      
      if (error) throw error;
      
      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from("learning_videos")
        .getPublicUrl(data.path);
      
      const publicUrl = urlData.publicUrl;
      setFileName(file.name);
      
      // Chamar onChange com todos os dados relevantes
      onChange(publicUrl, "file", file.name, data.path, file.size);
      
      toast.success("Vídeo carregado com sucesso");
    } catch (error) {
      console.error("Erro ao fazer upload do vídeo:", error);
      toast.error("Erro ao fazer upload do vídeo. Tente novamente.");
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
  };
  
  // Lidar com entrada de URL do YouTube
  const handleYoutubeUrl = () => {
    if (!urlInput) {
      toast.error("Por favor, insira uma URL do YouTube");
      return;
    }
    
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
        return;
      }
      
      // Criar URL de incorporação
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      // Obter URL da thumbnail
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      
      // Atualizar com URL de incorporação
      onChange(embedUrl, "youtube");
      
      toast.success("URL do YouTube processada com sucesso");
    } catch (error) {
      console.error("Erro ao processar URL do YouTube:", error);
      toast.error("URL inválida. Verifique e tente novamente.");
    }
  };

  // Alternar entre upload de arquivo e URL do YouTube
  const [uploadType, setUploadType] = useState<"file" | "youtube">(videoType === "youtube" ? "youtube" : "file");

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
            />
            <Button type="button" onClick={handleYoutubeUrl}>
              Adicionar
            </Button>
          </div>
          
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
                  "border-gray-300 dark:border-gray-600"
                )}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <>
                      <Loader2 className="w-8 h-8 mb-3 text-gray-500 animate-spin" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fazendo upload...
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
        </div>
      )}
    </div>
  );
};
