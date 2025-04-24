
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useVideoManagement } from "@/hooks/admin/useVideoManagement";
import VideoHeader from "./videos/VideoHeader";
import EmptyVideoState from "./components/EmptyVideoState";
import VideosList from "./components/VideosList";
import YouTubeVideoForm from "./components/YouTubeVideoForm";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface VideoTabProps {
  solution: any;
  currentValues: any;
  onSubmit: (values: any) => Promise<void>;
  saving: boolean;
}

const VideoTab: React.FC<VideoTabProps> = ({
  solution,
  currentValues,
  onSubmit,
  saving
}) => {
  const {
    videos,
    loading,
    uploading,
    uploadProgress,
    youtubeDialogOpen,
    setYoutubeDialogOpen,
    handleAddYouTube,
    handleFileUpload,
    handleRemoveVideo,
    fetchVideos
  } = useVideoManagement(solution?.id);
  
  const [isVerifying, setIsVerifying] = useState(false);

  // Forçar a atualização da lista de vídeos quando o componente é montado
  useEffect(() => {
    console.log("[VideoTab] Componente montado, buscando vídeos...");
    fetchVideos();
  }, [solution?.id, fetchVideos]);

  // Verificar se há registros no banco de dados
  const verifyDatabaseRecords = async () => {
    if (!solution?.id) return;
    
    setIsVerifying(true);
    try {
      const { data, error, count } = await supabase
        .from("solution_resources")
        .select("*", { count: "exact" })
        .eq("solution_id", solution.id)
        .eq("type", "video");
        
      if (error) throw error;
      
      toast(`Encontrados ${count} vídeos no banco de dados`, {
        description: "Verificação concluída, atualizando lista...",
      });
      
      console.log("[VideoTab] Verificação direta do banco:", data);
      await fetchVideos(); // Atualizar a lista após verificação
    } catch (error) {
      console.error("[VideoTab] Erro ao verificar banco de dados:", error);
      toast("Erro ao verificar registros", {
        description: "Não foi possível verificar os registros no banco de dados."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUploadFile = async (file: File) => {
    console.log("[VideoTab] Arquivo selecionado:", file.name);
    const success = await handleFileUpload(file);
    
    if (success) {
      console.log("[VideoTab] Upload realizado com sucesso, recarregando vídeos");
      // Dar tempo para a inserção propagar no banco de dados
      setTimeout(async () => {
        await fetchVideos();
        console.log("[VideoTab] Recarregamento de vídeos após upload concluído");
      }, 1000);
    }
  };

  return (
    <div className="space-y-8">
      <VideoHeader
        solutionId={solution?.id}
        onYoutubeClick={() => setYoutubeDialogOpen(true)}
        onFileUpload={handleUploadFile}
        isUploading={uploading}
        uploadProgress={uploadProgress}
      />

      <Card className="border-2 border-[#0ABAB5]/10 shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#0ABAB5]">
              {videos.length > 0 ? `Vídeos adicionados (${videos.length})` : "Vídeos"}
            </h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchVideos}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar lista
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={verifyDatabaseRecords}
                disabled={isVerifying}
                className="flex items-center gap-2"
              >
                {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Verificar BD
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#0ABAB5]" />
                <span className="mt-2 text-sm text-muted-foreground">Carregando vídeos...</span>
              </div>
            </div>
          ) : videos.length === 0 ? (
            <EmptyVideoState 
              onYoutubeClick={() => setYoutubeDialogOpen(true)}
              onFileUploadClick={() => document.getElementById('video-file-input')?.click()}
              solutionId={solution?.id}
              uploading={uploading}
            />
          ) : (
            <VideosList videos={videos} onRemove={handleRemoveVideo} />
          )}
        </CardContent>
      </Card>

      <YouTubeVideoForm
        isOpen={youtubeDialogOpen}
        onOpenChange={setYoutubeDialogOpen}
        onAddYouTube={handleAddYouTube}
        isUploading={uploading}
      />
    </div>
  );
};

export default VideoTab;
