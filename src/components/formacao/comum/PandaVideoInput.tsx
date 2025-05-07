
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PandaVideoSelector } from "./PandaVideoSelector";
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
}

export const PandaVideoInput = ({ onChange, initialValue }: PandaVideoInputProps) => {
  const [activeTab, setActiveTab] = useState<string>("upload");
  
  const handleVideoSelected = (videoData: any) => {
    onChange(videoData);
  };

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
          <PandaVideoSelector 
            onSelectVideo={handleVideoSelected}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
