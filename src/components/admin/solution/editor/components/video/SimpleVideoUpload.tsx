
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

  // Wrapper para adaptar a tipagem de retorno
  const handleYouTubeFormSubmit = async (data: { name: string; url: string; description: string; }) => {
    await handleYoutubeUpload(data);
    return; // Garantir que retorna void
  };

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
        onAddYouTube={handleYouTubeFormSubmit}
        isOpen={youtubeOpen}
        onOpenChange={setYoutubeOpen}
        isUploading={uploading}
      />
    </div>
  );
};
