
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, Youtube } from "lucide-react";

interface VideoUploadHeaderProps {
  onYouTubeClick: () => void;
  children?: React.ReactNode;
}

const VideoUploadHeader: React.FC<VideoUploadHeaderProps> = ({
  onYouTubeClick,
  children
}) => {
  return (
    <div className="flex justify-between items-center gap-4 w-full">
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={onYouTubeClick}
          className="flex items-center gap-2"
        >
          <Youtube className="h-4 w-4 text-red-500" />
          <span className="hidden md:inline">Adicionar do YouTube</span>
          <span className="inline md:hidden">YouTube</span>
        </Button>

        {children && (
          <div className="flex items-center">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploadHeader;
