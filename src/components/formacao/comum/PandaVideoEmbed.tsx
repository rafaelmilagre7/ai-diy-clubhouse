
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
    
    console.log('🎥 PandaVideoEmbed - Processando iframe:', embedCode);
    const videoInfo = extractPandaVideoInfo(embedCode);
    console.log('🎥 PandaVideoEmbed - Resultado da extração:', videoInfo);
    
    if (!videoInfo || !videoInfo.videoId) {
      console.error('🎥 PandaVideoEmbed - Falha na extração do videoId');
      setError('O código de incorporação parece ser inválido. Certifique-se de que é um iframe do Panda Video.');
      return;
    }
    
    setError(null);
    console.log('🎥 PandaVideoEmbed - Chamando onChange com:', {
      embedCode,
      videoId: videoInfo.videoId,
      url: videoInfo.url,
      thumbnailUrl: videoInfo.thumbnailUrl
    });
    onChange(
      embedCode,
      videoInfo.videoId,
      videoInfo.url,
      videoInfo.thumbnailUrl
    );
  };
  
  return (
    <div className="space-y-2">
      {label && <Label className="text-neutral-800 dark:text-white font-medium">{label}</Label>}
      <Textarea
        placeholder="Cole aqui o código iframe do Panda Video"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="font-mono text-xs h-32 resize-none text-neutral-800 dark:text-white"
      />
      {description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-300">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {value && !error && (
        <div className="text-sm text-green-600 dark:text-green-400">
          Código de incorporação válido
        </div>
      )}
    </div>
  );
};

export default PandaVideoEmbed;
