import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FileVideoUploader from "./FileVideoUploader";
import YouTubeVideoForm from "./YouTubeVideoForm";
import { useVideoUpload } from "./useVideoUpload";
import { Plus, Upload, Youtube } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SimpleVideoUploadProps {
  solutionId: string | undefined;
}

export const SimpleVideoUpload: React.FC<SimpleVideoUploadProps> = ({ solutionId }) => {
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const {
    handleFileUpload,
    handleYoutubeUpload,
    uploading,
    uploadProgress
  } = useVideoUpload({ solutionId });

  // Wrapper para adaptar a tipagem de retorno
  const handleYouTubeFormSubmit = async (data: { name: string; url: string; description: string; }) => {
    await handleYoutubeUpload(data);
    return; // Garantir que retorna void
  };

  // Função de manipulação para o upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold">Adicionar Vídeos</CardTitle>
        <CardDescription>
          Adicione vídeos para enriquecer sua solução de IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="upload" disabled={!solutionId}>
              <Upload className="h-4 w-4 mr-2" />
              Upload de Arquivo
            </TabsTrigger>
            <TabsTrigger value="youtube" disabled={!solutionId}>
              <Youtube className="h-4 w-4 mr-2" />
              Vídeo do YouTube
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <FileVideoUploader
                onFileChange={handleFileChange}
                isUploading={uploading}
                uploadProgress={uploadProgress}
                disabled={!solutionId}
              />
            </div>
          </TabsContent>

          <TabsContent value="youtube" className="space-y-4">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <Button 
                onClick={() => setYoutubeOpen(true)} 
                variant="outline" 
                disabled={!solutionId || uploading}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar vídeo do YouTube
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {!solutionId && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
            Salve as informações básicas da solução antes de adicionar vídeos.
          </div>
        )}
      </CardContent>
      
      <YouTubeVideoForm
        onAddYouTube={handleYouTubeFormSubmit}
        isOpen={youtubeOpen}
        onOpenChange={setYoutubeOpen}
        isUploading={uploading}
      />
    </Card>
  );
};
