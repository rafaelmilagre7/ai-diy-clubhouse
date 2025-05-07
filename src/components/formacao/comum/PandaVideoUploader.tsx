
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

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

  const handleUpload = async () => {
    // Validação básica
    if (!title.trim()) {
      toast.error("O título do vídeo é obrigatório");
      return;
    }

    if (!url.trim()) {
      toast.error("A URL do vídeo é obrigatória");
      return;
    }

    // Verificar se a URL parece válida
    if (!url.startsWith("http")) {
      toast.error("Por favor, insira uma URL válida começando com http:// ou https://");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Chamar a função do Supabase para fazer o upload
      const { data, error } = await supabase.functions.invoke("upload-to-panda", {
        body: {
          title,
          description,
          url
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

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="video-title">Título do vídeo</Label>
        <Input
          id="video-title"
          placeholder="Ex: Introdução ao módulo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="video-description">Descrição (opcional)</Label>
        <Textarea
          id="video-description"
          placeholder="Descrição do conteúdo do vídeo"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isUploading}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="video-url">URL pública do vídeo</Label>
        <div className="flex flex-col gap-2">
          <Input
            id="video-url"
            placeholder="https://exemplo.com/meu-video.mp4"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground">
            Insira a URL pública do seu vídeo. Formatos aceitos: MP4, MOV, AVI, WMV.
          </p>
          <p className="text-xs text-primary">
            Exemplo: https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
          </p>
        </div>
      </div>

      <Button 
        type="button" 
        onClick={handleUpload}
        disabled={isUploading || !title || !url}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            Enviar vídeo 
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};
