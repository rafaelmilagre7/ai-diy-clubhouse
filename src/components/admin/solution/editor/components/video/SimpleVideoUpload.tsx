
import React, { useState } from "react";
import FileVideoUploader from "./FileVideoUploader";
import YouTubeVideoForm from "./YouTubeVideoForm";
import { useVideoUpload } from "./useVideoUpload";

interface SimpleVideoUploadProps {
  solutionId: string | undefined;
}

export const SimpleVideoUpload: React.FC<SimpleVideoUploadProps> = ({ solutionId }) => {
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const {
    handleFileUpload,
    handleYoutubeUpload,
    uploading,
    uploadProgress
  } = useVideoUpload({ solutionId });

  return (
    <div className="flex items-center gap-4">
      <FileVideoUploader
        onFileChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        isUploading={uploading}
        uploadProgress={uploadProgress}
        disabled={!solutionId}
      />
      
      <YouTubeVideoForm
        onAddYouTube={handleYoutubeUpload}
        isOpen={youtubeOpen}
        onOpenChange={setYoutubeOpen}
        isUploading={uploading}
      />
    </div>
  );
};
