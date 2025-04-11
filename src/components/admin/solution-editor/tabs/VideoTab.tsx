
import React from "react";
import VideoLessonsForm from "@/components/admin/solution/form/VideoLessonsForm";

interface VideoTabProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const VideoTab: React.FC<VideoTabProps> = ({
  solutionId,
  onSave,
  saving,
}) => {
  return (
    <VideoLessonsForm 
      solutionId={solutionId} 
      onSave={onSave} 
      saving={saving} 
    />
  );
};

export default VideoTab;
