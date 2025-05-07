
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Upload } from "lucide-react";
import { PandaVideoUploader } from "./PandaVideoUploader";
import { PandaVideoSelector } from "./PandaVideoSelector";

interface PandaVideoInputProps {
  onChange: (videoData: {
    url: string;
    type: string;
    title: string;
    video_id: string;
    thumbnail_url?: string;
    duration_seconds?: number;
  }) => void;
  initialValue?: {
    url?: string;
    title?: string;
    video_id?: string;
    thumbnail_url?: string;
    duration_seconds?: number;
  };
}

export const PandaVideoInput = ({ onChange, initialValue }: PandaVideoInputProps) => {
  const [activeTab, setActiveTab] = useState<string>(initialValue?.video_id ? "select" : "upload");
  
  const handleSelectExisting = (videoData: any) => {
    onChange({
      url: videoData.url,
      type: "panda",
      title: videoData.title,
      video_id: videoData.id,
      thumbnail_url: videoData.thumbnail_url,
      duration_seconds: videoData.duration_seconds
    });
  };
  
  const handleUploadComplete = (
    url: string,
    type: string,
    title: string,
    videoId: string,
    fileSize?: number,
    durationSeconds?: number,
    thumbnailUrl?: string
  ) => {
    onChange({
      url,
      type,
      title,
      video_id: videoId,
      thumbnail_url: thumbnailUrl,
      duration_seconds: durationSeconds
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload" className="flex items-center gap-1">
          <Upload className="h-4 w-4" />
          <span>Upload</span>
        </TabsTrigger>
        <TabsTrigger value="select" className="flex items-center gap-1">
          <Video className="h-4 w-4" />
          <span>Biblioteca</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upload" className="space-y-3 mt-3">
        <PandaVideoUploader
          onChange={handleUploadComplete}
          initialValue={activeTab === "upload" ? initialValue : undefined}
        />
      </TabsContent>
      
      <TabsContent value="select" className="space-y-3 mt-3">
        <PandaVideoSelector
          onSelect={handleSelectExisting}
          currentVideoId={initialValue?.video_id}
        />
      </TabsContent>
    </Tabs>
  );
};
