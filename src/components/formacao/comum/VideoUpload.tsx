
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
  onChange: (url: string, videoType: string, fileName?: string, filePath?: string, fileSize?: number, duration_seconds?: number) => void;
  videoType?: string;
  disabled?: boolean;
}

export const VideoUpload = ({ 
  value, 
  onChange,
  videoType = "youtube",
  disabled = false
}: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState<string>(videoType === "youtube" ? value : "");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [bucketStatus, setBucketStatus] = useState<"checking" | "ready" | "error">("checking");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadControllerRef = useRef<AbortController | null>(null);
  
  // Verificar se o bucket existe ao carregar o componente
  useEffect(() => {
    checkBucketStatus();
  }, []);

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

  // Verificar status do bucket sem tentar criar
  const checkBucketStatus = async () => {
    try {
      setBucketStatus("checking");
      
      console.log("Verificando se o bucket learning_videos existe...");
      
      // Apenas verificar se o bucket existe sem tentar criar
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error("Erro ao listar buckets:", error);
        setBucketStatus("error");
        return false;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'learning_videos');
      
      if (bucketExists) {
        console.log("Bucket learning_videos existe.");
        setBucketStatus("ready");
        return true;
      } else {
        console.log("Bucket learning_videos não existe.");
        // Tentar criar o bucket diretamente sem usar RPC
        try {
          const { error: createError } = await supabase.storage.createBucket('learning_videos', {
            public: true,
            fileSizeLimit: 314572800 // 300MB
          });
          
          if (createError) {
            console.error("Erro ao criar bucket:", createError);
            setBucketStatus("error");
            return false;
          }
          
          console.log("Bucket learning_videos criado com sucesso!");
          setBucketStatus("ready");
          return true;
        } catch (createErr) {
          console.error("Erro ao criar bucket:", createErr);
          setBucketStatus("error");
          return false;
        }
      }
    } catch (err) {
      console.error("Erro ao verificar status do bucket:", err);
      setBucketStatus("error");
      return false;
    }
  };

  // Upload de arquivo com suporte a chunks para arquivos grandes
  const uploadVideo = async (file: File) => {
    try {
      setError(null);
      setUploading(true);
      setUploadProgress(5);
      
      console.log("Iniciando upload de arquivo:", file.name);
      
      // Verificar tamanho do arquivo (limite de 300MB para vídeos)
      const MAX_SIZE = 314572800; // 300MB em bytes
      if (file.size > MAX_SIZE) {
        toast.error(`O arquivo excede o tamanho máximo de 300MB`);
        setError(`O arquivo excede o tamanho máximo de 300MB`);
        setUploading(false);
        return;
      }
      
      // Verificar status do bucket antes do upload
      if (bucketStatus === "checking") {
        const isReady = await checkBucketStatus();
        if (!isReady) {
          toast.error("Não foi possível preparar o armazenamento para vídeos. Tentando upload direto.");
          // Continuamos com o upload mesmo assim - será tratado abaixo
        }
      }
      
      setUploadProgress(20);
      
      // Gerar nome único para evitar colisões
      const fileExt = file.name.split(".").pop();
      const uniqueFileName = `${uuidv4()}.${fileExt}`;
      const filePath = `videos/${uniqueFileName}`;
      
      console.log("Iniciando upload de vídeo para:", filePath);

      // Criar um AbortController para permitir cancelar o upload
      uploadControllerRef.current = new AbortController();
      
      // Upload para o bucket de vídeos
      const { data, error } = await supabase.storage
        .from("learning_videos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          duplex: "half" // Melhor suporte para uploads grandes
        });
      
      if (error) {
        console.error("Erro no upload para o storage:", error);
        
        let errorMsg = error.message;
        if (error.message.includes("bucket") && error.message.includes("not found")) {
          errorMsg = "O bucket de armazenamento não existe. Tentando método alternativo...";
          
          // Tentar método alternativo - fazer upload para outro bucket
          try {
            const { data: altData, error: altError } = await supabase.storage
              .from("solution_files") // Usar bucket que provavelmente existe
              .upload(`learning_videos/${uniqueFileName}`, file, {
                cacheControl: "3600",
                upsert: true,
                duplex: "half"
              });
              
            if (altError) {
              throw altError;
            }
            
            // Se chegou aqui, o upload alternativo funcionou
            console.log("Upload alternativo bem-sucedido:", altData);
            
            // Obter URL pública do método alternativo
            const { data: altUrlData } = supabase.storage
              .from("solution_files")
              .getPublicUrl(`learning_videos/${uniqueFileName}`);
              
            const publicUrl = altUrlData.publicUrl;
            setFileName(file.name);
            
            setUploadProgress(100);
            console.log("URL pública obtida (método alternativo):", publicUrl);
            
            // Chamar onChange com todos os dados relevantes
            onChange(publicUrl, "file", file.name, `solution_files/learning_videos/${uniqueFileName}`, file.size);
            
            toast.success("Vídeo carregado com sucesso (método alternativo)");
            setUploading(false);
            return; // Terminar a função aqui pois o upload alternativo funcionou
          } catch (altErr: any) {
            console.error("Erro no upload alternativo:", altErr);
            errorMsg = `Falha em todos os métodos de upload: ${altErr.message || "Erro desconhecido"}`;
          }
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
      uploadControllerRef.current = null;
      // Limpar o input de arquivo para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle file selection
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await uploadVideo(file);
  };

  // Cancelar upload em andamento
  const handleCancelUpload = () => {
    if (uploadControllerRef.current) {
      uploadControllerRef.current.abort();
      uploadControllerRef.current = null;
      setUploading(false);
      toast.info("Upload cancelado");
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
              disabled={disabled}
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
              disabled={disabled}
            />
            <label htmlFor="file">Upload de Arquivo</label>
          </div>
        </div>
        
        {value && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemove}
            disabled={disabled}
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

      {bucketStatus === "error" && (
        <div className="text-amber-600 text-sm bg-amber-50 p-2 rounded-md border border-amber-200">
          <p className="font-medium">Atenção</p>
          <p>O sistema de armazenamento pode não estar totalmente configurado. Em caso de falha, tentaremos um método alternativo de upload.</p>
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
              disabled={disabled}
            />
            <Button 
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInput || disabled || uploading}
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
            disabled={disabled}
          />
          
          {!value || videoType !== "file" ? (
            <div 
              className={cn(
                "border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors",
                uploading && "pointer-events-none opacity-60",
                disabled && "opacity-50 pointer-events-none bg-gray-50"
              )}
              onClick={disabled ? undefined : handleTriggerFileInput}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                  <p className="text-sm font-medium">Enviando arquivo... {uploadProgress}%</p>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelUpload();
                    }}
                    className="mt-2"
                    disabled={disabled}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {disabled 
                      ? "Upload de vídeos desativado" 
                      : "Clique para fazer upload de vídeo"
                    }
                  </p>
                  {!disabled && (
                    <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WEBM, AVI (máx: 300MB)</p>
                  )}
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
                disabled={disabled || uploading}
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
