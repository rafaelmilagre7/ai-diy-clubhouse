
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Video, Youtube, Play, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadFileWithFallback, getYoutubeVideoId, getYoutubeThumbnailUrl } from '@/lib/supabase/storage';
import { PandaVideoEmbed } from './PandaVideoEmbed';
import { v4 as uuidv4 } from 'uuid';

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
  videoType: string;
  disabled?: boolean;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  value,
  onChange,
  videoType,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const fileType = file.type.split('/')[0];
    if (fileType !== 'video') {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de vídeo.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      console.log('Iniciando upload de vídeo...');
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `video_${uuidv4()}.${fileExt}`;
      const filePath = `videos/${fileName}`;
      
      setProgress(25);
      
      // Upload usando a função corrigida - FIXED ORDER OF PARAMETERS
      const result = await uploadFileWithFallback(
        file,
        'learning-videos',
        filePath
      );

      if (result.error) {
        console.error('Erro no upload:', result.error);
        throw new Error(`Erro no upload: ${result.error.message}`);
      }

      setProgress(75);
      
      // Construir URL pública
      const publicUrl = `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/learning-videos/${filePath}`;

      setProgress(100);
      
      console.log('Upload concluído:', publicUrl);
      
      onChange(
        publicUrl,
        'file',
        fileName,
        filePath,
        file.size,
        0, // duration will be calculated later
        '' // no thumbnail for uploaded files
      );
      
      toast({
        title: "Upload concluído",
        description: "O vídeo foi enviado com sucesso.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast({
        title: "Falha no upload",
        description: error.message || "Não foi possível enviar o vídeo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleYouTubeUrl = (url: string) => {
    if (!url.trim()) return;
    
    const videoId = getYoutubeVideoId(url);
    if (!videoId) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida do YouTube.",
        variant: "destructive",
      });
      return;
    }
    
    const thumbnailUrl = getYoutubeThumbnailUrl(videoId);
    onChange(url, 'youtube', undefined, videoId, undefined, undefined, thumbnailUrl);
    
    toast({
      title: "Vídeo do YouTube adicionado",
      description: "O vídeo foi configurado com sucesso.",
    });
  };

  const handlePandaVideoEmbed = (embedCode: string, videoId: string, url: string, thumbnailUrl: string) => {
    onChange(url, 'panda', undefined, videoId, undefined, undefined, thumbnailUrl);
    
    toast({
      title: "Vídeo do Panda adicionado",
      description: "O vídeo foi configurado com sucesso.",
    });
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <Label>Tipo de Vídeo</Label>
          <Select 
            value={videoType} 
            onValueChange={(value) => onChange('', value)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de vídeo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="youtube">
                <div className="flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  YouTube
                </div>
              </SelectItem>
              <SelectItem value="panda">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Panda Video
                </div>
              </SelectItem>
              <SelectItem value="file">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Upload Direto
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {videoType === 'youtube' && (
          <div className="space-y-2">
            <Label>URL do YouTube</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                onBlur={(e) => handleYouTubeUrl(e.target.value)}
                disabled={disabled}
              />
            </div>
            {value && videoType === 'youtube' && (
              <div className="text-sm text-green-600">
                Vídeo do YouTube configurado
              </div>
            )}
          </div>
        )}

        {videoType === 'panda' && (
          <PandaVideoEmbed
            value={value}
            onChange={handlePandaVideoEmbed}
          />
        )}

        {videoType === 'file' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {uploading ? (
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Enviando vídeo... {progress}%
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="video-upload"
                    disabled={disabled || uploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('video-upload')?.click()}
                    disabled={disabled || uploading}
                  >
                    Selecionar Vídeo
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Formatos suportados: MP4, WebM, MOV (máx. 100MB)
                  </p>
                </div>
              )}
            </div>
            {value && videoType === 'file' && (
              <div className="text-sm text-green-600">
                Vídeo enviado com sucesso
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
