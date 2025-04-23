
import React from "react";
import VideoLessonsForm from "@/components/admin/solution/form/VideoLessonsForm";

interface VideoFormProps {
  solutionId: string;
  onSave: () => Promise<void>;
  saving: boolean;
}

const VideoForm: React.FC<VideoFormProps> = ({ solutionId, onSave, saving }) => {
  return (
    <VideoLessonsForm
      solutionId={solutionId}
      onSave={onSave}
      saving={saving}
    />
  );
};

export default VideoForm;
