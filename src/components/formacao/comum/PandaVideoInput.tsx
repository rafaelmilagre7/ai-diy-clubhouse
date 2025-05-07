
import React, { useState, useRef, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { VideoData } from '@/components/formacao/aulas/types';
import { Loader2, Upload, Video } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface PandaVideoInputProps {
  onChange: (videoData: VideoData) => void;
  uploadOnly?: boolean;
}

export const PandaVideoInput: React.FC<PandaVideoInputProps> = ({
  onChange,
  uploadOnly = false
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setErrorMessage(null);
    
    if (!selectedFile) return;
    
    // Verificar tipo de arquivo
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMessage('Formato de vídeo não suportado. Use MP4, MOV, AVI ou WebM.');
      return;
    }
    
    // Verificar tamanho do arquivo (limite de 500MB)
    if (selectedFile.size > 500 * 1024 * 1024) {
      setErrorMessage('O arquivo é muito grande. O tamanho máximo é de 500MB.');
      return;
    }
    
    setFile(selectedFile);
  };

  const uploadToPandaVideo = async () => {
    if (!file) return;
    
    setUploading(true);
    setProgress(0);
    setErrorMessage(null);
    
    try {
      // Criar FormData para o upload
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, "")); // Nome do arquivo sem extensão
      formData.append('private', 'false');
      
      // Upload para a edge function do Supabase que faz a ponte com o Panda Video
      const { data, error } = await supabase.functions.invoke('upload-panda-video', {
        body: formData
      });
      
      if (error) {
        throw new Error(`Erro na edge function: ${error.message}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Falha no upload do vídeo');
      }
      
      // Atualizar parent com os dados do vídeo
      onChange({
        video_id: data.video.id,
        url: data.video.url,
        title: data.video.title,
        thumbnail_url: data.video.thumbnail_url,
        duration_seconds: data.video.duration || 0
      });
      
      toast.success('Vídeo enviado com sucesso!');
      setFile(null);
      
      // Limpar input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setErrorMessage(`Erro ao fazer upload: ${error.message}`);
      toast.error('Falha no upload do vídeo', {
        description: error.message
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3 border border-red-200 bg-red-50 rounded text-red-600 text-sm">
          {errorMessage}
        </div>
      )}
      
      {uploadOnly && (
        <Card className="border-2 border-dashed hover:border-primary/50 transition-all">
          <CardContent className="pt-6 pb-4 px-4">
            <Label 
              htmlFor="video-upload" 
              className="block text-center cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center py-4">
                <Video className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="font-medium text-base">
                  Selecione um vídeo para upload
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  MP4, MOV, AVI, WebM até 500MB
                </p>
              </div>
              <Input
                ref={fileInputRef}
                id="video-upload"
                type="file"
                className="hidden"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                onChange={handleFileChange}
              />
            </Label>
            
            {file && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="truncate max-w-[70%]">
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={uploadToPandaVideo}
                    disabled={uploading}
                    size="sm"
                    className="gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Fazer Upload
                      </>
                    )}
                  </Button>
                </div>
                
                {uploading && (
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
