
import React from "react";
import { LearningLessonVideo } from "@/lib/supabase";
import { formatSeconds } from "@/utils/timeUtils";

interface LessonDurationProps {
  videos: LearningLessonVideo[];
}

export const LessonDuration: React.FC<LessonDurationProps> = ({ videos }) => {
  const formatTotalDuration = () => {
    if (!videos || videos.length === 0) return null;
    
    let totalSeconds = 0;
    let hasValidDurations = false;
    
    videos.forEach(video => {
      if (video.duration_seconds) {
        totalSeconds += video.duration_seconds;
        hasValidDurations = true;
      }
    });
    
    if (!hasValidDurations) return null;
    
    return formatSeconds(totalSeconds);
  };

  const duration = formatTotalDuration();
  if (!duration) return null;
  
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <span>Duração total: {duration}</span>
    </div>
  );
};

export default LessonDuration;
