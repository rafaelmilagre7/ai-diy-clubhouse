import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, X, Image as ImageIcon, File } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploadButtonProps {
  onFileUploaded: (fileUrl: string, fileName: string, fileType: string) => void;
}

export const FileUploadButton = ({ onFileUploaded }: FileUploadButtonProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    // Preview para imagens
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Simular progresso
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(data.path);

      clearInterval(interval);
      setUploadProgress(100);

      onFileUploaded(urlData.publicUrl, file.name, file.type);
      toast.success('Arquivo enviado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao enviar arquivo: ' + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
        disabled={isUploading}
      />
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <Paperclip className="w-4 h-4" />
      </Button>

      {isUploading && (
        <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-background border border-border rounded-lg shadow-lg">
          {preview && (
            <div className="mb-2 relative">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-24 object-cover rounded"
              />
            </div>
          )}
          <Progress value={uploadProgress} className="h-1" />
          <p className="text-xs text-muted-foreground mt-1">
            Enviando... {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
};
