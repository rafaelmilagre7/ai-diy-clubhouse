import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  Upload, 
  Link as LinkIcon, 
  Trash2,
  RefreshCw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Progress } from "@/components/ui/progress";

interface PandaVideoUploaderProps {
  onChange: (videoData: any) => void;
  initialValue?: {
    url?: string;
    title?: string;
    video_id?: string;
    thumbnail_url?: string;
  };
}

export const PandaVideoUploader = ({ onChange, initialValue }: PandaVideoUploaderProps) => {
  const [title, setTitle] = useState(initialValue?.title || "");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("file"); // "file" ou "url"
  
  // Estado para o arquivo selecionado
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Upload para o Supabase Storage
  const {
    uploading: uploadingToStorage,
    uploadedFileUrl,
    handleFileUpload,
    error: storageError,
    cancelUpload
  } = useFileUpload({
    bucketName: "videos",
    folder: "temp",
    onUploadComplete: (publicUrl) => {
      // Quando o upload para o Storage for concluído, atualizamos a URL
      console.log("Arquivo enviado para o Storage: ", publicUrl);
      toast.success("Arquivo enviado para armazenamento temporário");
      // Iniciamos automaticamente o upload para o Panda
      handleUploadWithUrl(publicUrl, selectedFile?.name || "Vídeo sem título");
    },
    maxSize: 200 // 200MB
  });

  // Função para receber arquivo quando o usuário seleciona
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar tipo de arquivo
      const fileType = file.type;
      const validVideoTypes = ["video/mp4", "video/webm", "video/quicktime", "video/avi"];
      
      if (!validVideoTypes.includes(fileType)) {
        toast.error("Formato de arquivo inválido", {
          description: "Por favor, selecione um arquivo de vídeo (MP4, WEBM, MOV, AVI)"
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Verificar tamanho do arquivo (limite de 200MB)
      const maxSize = 200 * 1024 * 1024; // 200MB em bytes
      if (file.size > maxSize) {
        toast.error("Arquivo muito grande", {
          description: "O tamanho máximo permitido é 200MB"
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setSelectedFile(file);
      // Usar o nome do arquivo como título se o título estiver vazio
      if (!title) {
        // Remover extensão do arquivo para o título
        const fileName = file.name.split('.').slice(0, -1).join('.');
        setTitle(fileName);
      }
    }
  };

  // Função para limpar o arquivo selecionado
  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Cancelar upload se estiver em andamento
    if (uploadingToStorage) {
      cancelUpload();
    }
  };

  // Função para iniciar o upload do arquivo para o Storage
  const handleFileUploadToStorage = async () => {
    if (!selectedFile) {
      toast.error("Nenhum arquivo selecionado");
      return;
    }
    
    if (!title.trim()) {
      toast.error("O título do vídeo é obrigatório");
      return;
    }
    
    try {
      setError(null);
      // Upload para o Storage do Supabase
      await handleFileUpload(selectedFile);
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload do arquivo");
      toast.error("Erro no upload", {
        description: err.message || "Falha ao enviar o arquivo para o armazenamento"
      });
    }
  };

  // Função para upload usando URL (existente, modificada para reuso interno)
  const handleUploadWithUrl = async (videoUrl: string, videoTitle: string = title) => {
    // Validação básica
    if (!videoTitle.trim()) {
      toast.error("O título do vídeo é obrigatório");
      return;
    }

    if (!videoUrl.trim()) {
      toast.error("A URL do vídeo é obrigatória");
      return;
    }

    // Verificar se a URL parece válida
    if (!videoUrl.startsWith("http")) {
      toast.error("Por favor, insira uma URL válida começando com http:// ou https://");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Chamar a função do Supabase para fazer o upload
      const { data, error } = await supabase.functions.invoke("upload-to-panda", {
        body: {
          title: videoTitle,
          description: description,
          url: videoUrl
        }
      });

      if (error) {
        throw new Error(error.message || "Erro ao fazer upload do vídeo");
      }

      if (!data.success) {
        throw new Error(data.error || "Falha ao processar o vídeo");
      }

      // Vídeo enviado com sucesso
      toast.success("Vídeo enviado para processamento", {
        description: "O vídeo começará a ser processado e estará disponível em breve."
      });

      // Limpar campos
      setTitle("");
      setDescription("");
      setUrl("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notificar componente pai
      onChange(data.video);
    } catch (err: any) {
      setError(err.message || "Erro ao processar o upload do vídeo");
      toast.error("Falha ao enviar vídeo", {
        description: err.message
      });
      console.error("Erro ao fazer upload:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Função de upload via URL (para o botão de envio)
  const handleUrlUpload = () => {
    handleUploadWithUrl(url, title);
  };
  
  // Determinar se o botão de upload deve estar desativado
  const isUploadButtonDisabled = 
    isUploading || 
    uploadingToStorage || 
    !title || 
    (activeTab === "file" ? !selectedFile : !url);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {storageError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{storageError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="video-title">Título do vídeo</Label>
        <Input
          id="video-title"
          placeholder="Ex: Introdução ao módulo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading || uploadingToStorage}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="video-description">Descrição (opcional)</Label>
        <Textarea
          id="video-description"
          placeholder="Descrição do conteúdo do vídeo"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isUploading || uploadingToStorage}
          rows={3}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid grid-cols-2 mb-2">
          <TabsTrigger value="file" disabled={isUploading || uploadingToStorage}>
            Arquivo Local
          </TabsTrigger>
          <TabsTrigger value="url" disabled={isUploading || uploadingToStorage}>
            URL Externa
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="file" className="space-y-4 pt-2">
          <div className="border border-dashed rounded-lg p-4 bg-muted/30">
            <div className="space-y-2">
              <Label htmlFor="video-file">Selecione um arquivo de vídeo</Label>
              {!selectedFile ? (
                <Input
                  id="video-file"
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                  onChange={handleFileChange}
                  disabled={isUploading || uploadingToStorage}
                  className="cursor-pointer"
                />
              ) : (
                <div className="border rounded-md p-3 bg-muted/50 flex items-center justify-between">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <Upload className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm truncate">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round(selectedFile.size / 1024 / 1024 * 10) / 10} MB)
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearSelectedFile}
                    disabled={isUploading || uploadingToStorage}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              )}
            </div>
            
            {uploadingToStorage && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Enviando arquivo...</span>
                  <span>
                    <RefreshCw className="h-3 w-3 animate-spin inline mr-1" />
                    Isso pode demorar alguns minutos
                  </span>
                </div>
                <Progress
                  isIndeterminate
                  value={100}
                  className="h-1"
                />
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              Formatos aceitos: MP4, WEBM, MOV, AVI. Tamanho máximo: 200MB
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="url" className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="video-url">URL pública do vídeo</Label>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="video-url"
                  placeholder="https://exemplo.com/meu-video.mp4"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isUploading}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Insira a URL pública do seu vídeo. Formatos aceitos: MP4, MOV, AVI, WMV.
              </p>
              <p className="text-xs text-primary">
                Exemplo: https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button 
        type="button" 
        onClick={activeTab === "file" ? handleFileUploadToStorage : handleUrlUpload}
        disabled={isUploadButtonDisabled}
        className="w-full"
      >
        {isUploading || uploadingToStorage ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {uploadingToStorage ? "Enviando arquivo..." : "Processando vídeo..."}
          </>
        ) : (
          <>
            Enviar vídeo 
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      
      <div className="text-xs text-muted-foreground italic text-center">
        Após o envio, o processamento do vídeo pode levar alguns minutos antes do vídeo aparecer na biblioteca.
      </div>
    </div>
  );
};
