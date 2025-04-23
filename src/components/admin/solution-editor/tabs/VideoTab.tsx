
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import VideoForm from "@/components/admin/solution/VideoForm";

interface VideoTabProps {
  solutionId: string;
  onSave: () => Promise<void>;
  saving: boolean;
}

const VideoTab: React.FC<VideoTabProps> = ({ solutionId, onSave, saving }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <VideoForm 
          solutionId={solutionId}
          onSave={onSave}
          saving={saving}
        />
      </CardContent>
    </Card>
  );
};

export default VideoTab;
