
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Loader2, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { createStoragePublicPolicy } from "@/lib/supabase/rpc";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      
      // Verifica e cria o bucket + políticas usando a função RPC
      const { success, error } = await createStoragePublicPolicy('learning_videos');
      
      if (!success) {
        console.error("Erro ao configurar bucket:", error);
        return false;
      }
      
      console.log("Bucket learning_videos configurado com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao verificar/criar bucket:", error);
      return false;
    }
  };

  // Handle file selection
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await uploadVideo(file);
  };

  // Upload de arquivo
  const uploadVideo = async (file: File) => {
    try {
      setError(null);
      setUploading(true);
      setUploadProgress(5);
      
      console.log("Iniciando upload de arquivo:", file.name);
      
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
        
        let errorMsg = error.message;
        if (error.message.includes("exceeded the maximum allowed size")) {
          errorMsg = "O arquivo excede o tamanho máximo permitido (100MB)";
        } else if (error.message.includes("bucket") && error.message.includes("not found")) {
          errorMsg = "O bucket de armazenamento não existe. Por favor, contate o administrador.";
        }
        
        toast.error(`Erro no upload: ${errorMsg}`);
        setError(`Erro no upload: ${errorMsg}`);
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
      
      // Chamar onChange com todos os dados relevantes
      onChange(publicUrl, "file", file.name, data.path, file.size);
      
      setUploadProgress(100);
      toast.success("Vídeo carregado com sucesso");
    } catch (error: any) {
      console.error("Erro ao fazer upload do vídeo:", error);
      setError(`Erro no upload: ${error.message || "Ocorreu um erro desconhecido"}`);
      toast.error(`Falha no upload: ${error.message || "Erro desconhecido"}`);
    } finally {
      setUploading(false);
      // Limpar o input de arquivo para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle YouTube URL submission
  const handleUrlSubmit = () => {
    if (!urlInput) {
      setError("Por favor, insira uma URL válida");
      return;
    }

    // Validação simples para URL do YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!youtubeRegex.test(urlInput)) {
      setError("Por favor, insira uma URL válida do YouTube");
      toast.error("Por favor, insira uma URL válida do YouTube");
      return;
    }

    try {
      onChange(urlInput, "youtube");
      toast.success("URL do YouTube adicionada com sucesso");
    } catch (error: any) {
      console.error("Erro ao adicionar URL do YouTube:", error);
      setError(`Erro: ${error.message || "Ocorreu um erro desconhecido"}`);
    }
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Remover vídeo
  const handleRemove = () => {
    onChange("", videoType === "youtube" ? "youtube" : "file");
    setFileName(null);
    setUrlInput("");
  };

  return (
    <div className="w-full space-y-4">
      {/* Seleção de tipo de vídeo */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input 
              type="radio" 
              name="video-type" 
              id="youtube" 
              checked={videoType === "youtube"}
              className="mr-2"
              onChange={() => onChange(value, "youtube")}
            />
            <label htmlFor="youtube">YouTube</label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="radio" 
              name="video-type" 
              id="file" 
              checked={videoType === "file"}
              className="mr-2"
              onChange={() => onChange(value, "file")}
            />
            <label htmlFor="file">Upload de Arquivo</label>
          </div>
        </div>
        
        {value && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemove}
          >
            <X className="h-4 w-4 mr-1" /> Remover
          </Button>
        )}
      </div>
      
      {error && (
        <div className="text-destructive text-sm bg-destructive/10 p-2 rounded-md">
          {error}
        </div>
      )}
      
      {/* YouTube URL input */}
      {videoType === "youtube" && (
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              placeholder="Cole a URL do vídeo do YouTube"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInput}
            >
              Adicionar
            </Button>
          </div>
          
          {value && videoType === "youtube" && (
            <div className="rounded-md border p-2 flex items-center justify-between">
              <div className="flex items-center">
                <Video className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm truncate">{value}</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* File upload */}
      {videoType === "file" && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelected}
            className="hidden"
          />
          
          {!value || videoType !== "file" ? (
            <div 
              className={cn(
                "border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors",
                uploading && "pointer-events-none opacity-60"
              )}
              onClick={handleTriggerFileInput}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                  <p className="text-sm font-medium">Enviando arquivo... {uploadProgress}%</p>
                </div>
              ) : (
                <>
                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Clique para fazer upload de vídeo</p>
                  <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WEBM, AVI (máx: 100MB)</p>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-md border p-2 flex items-center justify-between">
              <div className="flex items-center">
                <Video className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm truncate">{fileName || value}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTriggerFileInput}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Alterar"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
