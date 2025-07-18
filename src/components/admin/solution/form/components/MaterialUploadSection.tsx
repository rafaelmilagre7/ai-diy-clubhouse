
import React from "react";
import ResourceUploadCard from "./ResourceUploadCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ResourceMetadata } from "../types/ResourceTypes";
import { detectFileType, getFileFormatName } from "../utils/resourceUtils";

interface MaterialUploadSectionProps {
  solutionId: string | null;
  onUploadComplete: (url: string, fileName: string, fileSize: number) => Promise<void>;
  bucketReady?: boolean;
}

const MaterialUploadSection: React.FC<MaterialUploadSectionProps> = ({
  solutionId,
  onUploadComplete,
  bucketReady = true
}) => {
  const { toast } = useToast();

  // FASE 3: Correção Panda Video - Regex e extração melhoradas
  const extractPandaVideoInfo = (url: string) => {
    console.log('🎬 [PANDA_EXTRACT] Extraindo info do Panda Video:', url);
    
    // Padrões atualizados para diferentes formatos do Panda Video
    const patterns = [
      // Embed direto - padrão mais comum
      /embed\.pandavideo\.com\.br\/([a-f0-9-]+)/i,
      // Player direto com variações de subdomínio
      /player(?:-[^.]+)?\.tv\.pandavideo\.com\.br\/embed\/\?v=([a-f0-9-]+)/i,
      // URLs completas com parâmetros
      /(?:www\.)?pandavideo\.com\.br.*[?&]v=([a-f0-9-]+)/i,
      // URLs de compartilhamento
      /share\.pandavideo\.com\.br\/([a-f0-9-]+)/i,
      // IDs diretos (formato UUID)
      /^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i,
      // IDs sem hífen
      /^([a-f0-9]{32})$/i
    ];

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = url.match(pattern);
      if (match && match[1]) {
        const videoId = match[1];
        console.log(`✅ [PANDA_EXTRACT] Video ID encontrado (padrão ${i + 1}):`, videoId);
        
        // Normalizar videoId para formato com hífens se necessário
        const normalizedVideoId = videoId.length === 32 && !videoId.includes('-') 
          ? `${videoId.substr(0,8)}-${videoId.substr(8,4)}-${videoId.substr(12,4)}-${videoId.substr(16,4)}-${videoId.substr(20,12)}`
          : videoId;
        
        return {
          videoId: normalizedVideoId,
          embedUrl: `https://player-primevoltz.tv.pandavideo.com.br/embed/?v=${normalizedVideoId}`,
          thumbnailUrl: `https://b-vz-944bf9ba-e45.tv.pandavideo.com.br/${normalizedVideoId}/thumbs/001.jpg`
        };
      }
    }

    console.error('❌ [PANDA_EXTRACT] Padrão não reconhecido para URL:', url);
    console.error('❌ [PANDA_EXTRACT] Formatos suportados: embed.pandavideo.com.br, player-*.tv.pandavideo.com.br, share.pandavideo.com.br, UUID direto');
    return null;
  };

  const handleYoutubeUrlSubmit = async (url: string) => {
    try {
      console.log('🎬 [PANDA_SUBMIT] Processando URL do Panda Video:', url);
      
      if (!solutionId) {
        console.error('❌ [PANDA_SUBMIT] Solution ID não fornecido');
        toast({
          title: "Erro interno",
          description: "ID da solução não encontrado. Recarregue a página.",
          variant: "destructive",
        });
        return;
      }

      const videoInfo = extractPandaVideoInfo(url);
      
      if (!videoInfo) {
        console.error('❌ [PANDA_SUBMIT] Falha na extração de videoInfo para URL:', url);
        toast({
          title: "URL inválida do Panda Video",
          description: "Formatos aceitos: embed.pandavideo.com.br, player-*.tv.pandavideo.com.br, share.pandavideo.com.br ou ID direto",
          variant: "destructive",
        });
        return;
      }

      console.log('📹 [PANDA_INFO] Informações extraídas:', videoInfo);
      console.log('💾 [PANDA_SAVE] Salvando no solution_resources...');

      // Inserir recurso no banco
      const { data, error } = await supabase
        .from('solution_resources')
        .insert({
          solution_id: solutionId,
          name: `Vídeo Panda - ${videoInfo.videoId}`,
          url: videoInfo.embedUrl,
          type: 'video',
          file_size: 0,
          video_id: videoInfo.videoId,
          video_type: 'panda',
          thumbnail_url: videoInfo.thumbnailUrl
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [PANDA_SAVE] Erro ao salvar no banco:', error);
        console.error('❌ [PANDA_SAVE] Detalhes do erro:', JSON.stringify(error, null, 2));
        throw new Error(`Erro ao salvar vídeo: ${error.message}`);
      }

      console.log('✅ [PANDA_SAVE] Vídeo salvo com sucesso:', data);
      console.log('🔄 [PANDA_CALLBACK] Chamando onUploadComplete...');

      // Chamar callback de sucesso
      await onUploadComplete(videoInfo.embedUrl, `video-${videoInfo.videoId}`, 0);
      
      toast({
        title: "✅ Vídeo Panda adicionado",
        description: `Vídeo ${videoInfo.videoId} foi adicionado com sucesso aos recursos.`,
      });

    } catch (error: any) {
      console.error('❌ [PANDA_SUBMIT] Erro completo:', error);
      console.error('❌ [PANDA_SUBMIT] Stack trace:', error.stack);
      toast({
        title: "Erro ao adicionar vídeo Panda",
        description: error.message || "Erro desconhecido ao processar o vídeo do Panda.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="text-neutral-800 dark:text-white">
      <ResourceUploadCard 
        handleUploadComplete={onUploadComplete}
        handleYoutubeUrlSubmit={handleYoutubeUrlSubmit}
        bucketReady={bucketReady}
      />
    </div>
  );
};

export default MaterialUploadSection;
