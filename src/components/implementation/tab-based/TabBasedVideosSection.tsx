
import React from "react";
import { useSolutionDataContext } from "@/contexts/SolutionDataContext";
import { SolutionVideoCard } from "@/components/solution/videos/SolutionVideoCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSectionTracking } from "@/hooks/implementation/useSectionTracking";

interface TabBasedVideosSectionProps {
  onSectionComplete: () => void;
  onValidation: (watchedCount: number, totalWatchTime: number) => { isValid: boolean; message?: string; requirement?: string; };
  isCompleted: boolean;
}

export const TabBasedVideosSection = ({ onSectionComplete, onValidation, isCompleted }: TabBasedVideosSectionProps) => {
  const { data, isLoading } = useSolutionDataContext();
  const { trackInteraction, getTimeSpentInSeconds, getActionCount } = useSectionTracking("videos");

  const handleVideoWatch = () => {
    trackInteraction("watch");
  };

  const handleSectionComplete = () => {
    const watchedCount = getActionCount("watch");
    const totalWatchTime = getTimeSpentInSeconds();
    const validation = onValidation(watchedCount, totalWatchTime);
    
    if (validation.isValid) {
      onSectionComplete();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const videos = data?.videos || [];

  if (videos.length === 0) {
    return (
      <Card className="border-white/10">
        <CardContent className="p-8 text-center">
          <PlayCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Nenhum vídeo disponível</h3>
          <p className="text-gray-500 mb-4">
            Esta solução não possui vídeos tutoriais específicos.
          </p>
          <Button 
            onClick={onSectionComplete}
            className="bg-viverblue hover:bg-viverblue-dark"
          >
            Continuar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              Vídeo-aulas
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Assista aos vídeos tutoriais para implementar esta solução passo a passo
            </p>
          </div>
          {isCompleted && (
            <CheckCircle className="w-6 h-6 text-green-500" />
          )}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {videos.map((video) => (
          <div key={video.id} onClick={handleVideoWatch}>
            <SolutionVideoCard video={video} />
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={handleSectionComplete}
          disabled={isCompleted}
          className="bg-viverblue hover:bg-viverblue-dark"
        >
          {isCompleted ? "Seção Concluída" : "Marcar como Concluída"}
        </Button>
      </div>
    </div>
  );
};
