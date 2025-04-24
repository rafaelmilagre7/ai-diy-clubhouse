
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useVideoManagement } from "@/hooks/admin/useVideoManagement";
import VideosList from "./components/VideosList";
import YouTubeVideoForm from "./components/YouTubeVideoForm";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import VideoUploader from "./components/VideoUploader";

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
  
  const [isVerifying, setIsVerifying] = React.useState(false);

  useEffect(() => {
    console.log("[VideoTab] Componente montado, buscando vídeos...");
    fetchVideos();
  }, [solution?.id, fetchVideos]);

  // Verificar registros no banco de dados
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
      await fetchVideos();
    } catch (error) {
      console.error("[VideoTab] Erro ao verificar banco de dados:", error);
      toast("Erro ao verificar registros", {
        description: "Não foi possível verificar os registros no banco de dados."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Informação de debug sobre o bucket atual
  const verifyStorageBuckets = async () => {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) throw error;
      
      console.log("[VideoTab] Buckets disponíveis:", buckets);
      toast("Buckets verificados", {
        description: `Existem ${buckets?.length || 0} buckets. Verifique o console para detalhes.`,
      });
    } catch (error) {
      console.error("[VideoTab] Erro ao listar buckets:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Área de Upload SEMPRE em primeiro lugar */}
      <Card className="border-2 border-[#0ABAB5]/10 shadow-sm">
        <CardContent className="p-6">
          <VideoUploader
            onFileSelect={handleFileUpload}
            isUploading={uploading}
            uploadProgress={uploadProgress}
            disabled={!solution?.id}
          />
          
          {!solution?.id && (
            <div className="flex items-center p-4 gap-2 bg-amber-50 border border-amber-200 rounded-md mt-4">
              <p className="text-sm text-amber-800">
                Salve as informações básicas antes de adicionar vídeos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Área de Controles e Botões */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#0ABAB5]">
          Vídeos da solução {videos.length > 0 ? `(${videos.length})` : ''}
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchVideos}
            className="flex items-center gap-2"
            title="Atualizar lista de vídeos do servidor"
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
            title="Verificar dados diretamente no banco"
          >
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Verificar BD
          </Button>
          <Button
            variant="outline"
            size="sm" 
            onClick={verifyStorageBuckets}
            title="Verificar buckets de armazenamento"
          >
            Verificar Buckets
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setYoutubeDialogOpen(true)}
            disabled={!solution?.id || uploading}
          >
            Adicionar do YouTube
          </Button>
        </div>
      </div>

      {/* Lista de Vídeos - Aparece DEPOIS dos controles e da área de upload */}
      <Card className="border-2 border-[#0ABAB5]/10 shadow-sm">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#0ABAB5]" />
                <span className="mt-2 text-sm text-muted-foreground">Carregando vídeos...</span>
              </div>
            </div>
          ) : videos.length > 0 ? (
            <VideosList videos={videos} onRemove={handleRemoveVideo} />
          ) : (
            <div className="text-center p-6">
              <p className="text-muted-foreground">
                Nenhum vídeo adicionado ainda. Use o formulário acima para fazer upload.
              </p>
            </div>
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
