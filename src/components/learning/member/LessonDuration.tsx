
import React from "react";
import { LearningLessonVideo } from "@/lib/supabase";

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
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes} minutos`;
    }
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
