
import React from "react";
import { Solution } from "@/types/supabaseTypes";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import VideoLessonsForm from "@/components/admin/solution/form/VideoLessonsForm";

interface VideoFormProps {
  solution: Solution;
  onSave: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

const VideoForm: React.FC<VideoFormProps> = ({ solution, onSave, saving }) => {
  return (
    <VideoLessonsForm
      solutionId={solution?.id}
      onSave={async () => await onSave(solution as SolutionFormValues)}
      isSaving={saving}
    />
  );
};

export default VideoForm;
