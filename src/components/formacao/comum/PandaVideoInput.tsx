
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PandaVideoUploader } from "./PandaVideoUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PandaVideoInputProps {
  onChange: (videoData: any) => void;
  initialValue?: {
    url?: string;
    title?: string;
    video_id?: string;
    thumbnail_url?: string;
    duration_seconds?: number;
  };
  uploadOnly?: boolean;
}

export const PandaVideoInput = ({ 
  onChange, 
  initialValue, 
  uploadOnly = false
}: PandaVideoInputProps) => {
  const [activeTab, setActiveTab] = useState<string>("upload");
  
  const handleVideoSelected = (videoData: any) => {
    onChange(videoData);
  };

  // Se uploadOnly for verdadeiro, mostrar apenas o componente de upload
  if (uploadOnly) {
    return (
      <div className="space-y-4">
        <PandaVideoUploader 
          onChange={handleVideoSelected}
          initialValue={initialValue}
        />
      </div>
    );
  }

  // Caso contrário, mostrar o componente com abas
  return (
    <div className="space-y-4">
      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="upload" className="flex-1">Fazer upload</TabsTrigger>
          <TabsTrigger value="select" className="flex-1">Biblioteca</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="pt-4">
          <PandaVideoUploader 
            onChange={handleVideoSelected}
            initialValue={initialValue}
          />
        </TabsContent>
        
        <TabsContent value="select" className="pt-4">
          <div className="p-4 text-center text-muted-foreground">
            <p>Selecione vídeos da biblioteca do Panda Video.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
