
import React from "react";
import VideoForm from "@/components/admin/solution/VideoForm";

interface VideoTabProps {
  solution: any;
  onSubmit: (values: any) => Promise<void>;
  saving?: boolean;
}

const VideoTab: React.FC<VideoTabProps> = ({ solution, onSubmit, saving }) => {
  return (
    <VideoForm
      solution={solution}
      onSave={onSubmit}
      saving={saving}
    />
  );
};

export default VideoTab;
