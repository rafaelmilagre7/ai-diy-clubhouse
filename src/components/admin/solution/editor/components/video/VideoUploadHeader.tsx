import React from "react";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Youtube } from "lucide-react";
interface VideoUploadHeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  onYouTubeClick: () => void;
  children?: React.ReactNode;
}
const VideoUploadHeader: React.FC<VideoUploadHeaderProps> = ({
  activeTab,
  onTabChange,
  onYouTubeClick,
  children
}) => {
  return <div className="flex justify-between items-center">
      
      <div className="flex gap-2">
        <TabsList className="hidden sm:inline-flex">
          <TabsTrigger value="all" onClick={() => onTabChange("all")} className={activeTab === "all" ? "bg-primary text-primary-foreground" : ""}>
            Todos
          </TabsTrigger>
          <TabsTrigger value="youtube" onClick={() => onTabChange("youtube")} className={activeTab === "youtube" ? "bg-primary text-primary-foreground" : ""}>
            YouTube
          </TabsTrigger>
          <TabsTrigger value="upload" onClick={() => onTabChange("upload")} className={activeTab === "upload" ? "bg-primary text-primary-foreground" : ""}>
            Arquivos
          </TabsTrigger>
        </TabsList>
        
        <Button size="sm" variant="outline" onClick={onYouTubeClick}>
          <Youtube className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Adicionar do YouTube</span>
          <span className="inline md:hidden">YouTube</span>
        </Button>
        
        {children}
      </div>
    </div>;
};
export default VideoUploadHeader;