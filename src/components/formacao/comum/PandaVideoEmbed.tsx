
import React, { useState } from 'react';
import { extractPandaVideoInfo } from '@/lib/supabase/storage';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PandaVideoEmbedProps {
  value?: string;
  onChange: (embedCode: string, videoId: string, url: string, thumbnailUrl: string) => void;
  label?: string;
  description?: string;
}

export const PandaVideoEmbed: React.FC<PandaVideoEmbedProps> = ({
  value = '',
  onChange,
  label = 'Código de Incorporação do Panda Video',
  description = 'Cole o código iframe completo fornecido pelo Panda Video'
}) => {
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (embedCode: string) => {
    if (!embedCode.trim()) {
      setError(null);
      return;
    }
    
    const videoInfo = extractPandaVideoInfo(embedCode);
    
    if (!videoInfo || !videoInfo.videoId) {
      setError('O código de incorporação parece ser inválido. Certifique-se de que é um iframe do Panda Video.');
      return;
    }
    
    setError(null);
    onChange(
      embedCode,
      videoInfo.videoId,
      videoInfo.url,
      videoInfo.thumbnailUrl
    );
  };
  
  return (
    <div className="space-y-2">
      {label && <Label className="text-foreground font-medium">{label}</Label>}
      <Textarea
        placeholder="Cole aqui o código iframe do Panda Video"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="font-mono text-xs h-32 resize-none text-foreground"
      />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {value && !error && (
        <div className="text-sm text-system-healthy">
          Código de incorporação válido
        </div>
      )}
    </div>
  );
};

export default PandaVideoEmbed;
