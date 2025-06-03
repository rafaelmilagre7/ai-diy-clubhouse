
import React from "react";
import { Play } from "lucide-react";

export const SolutionVideosEmpty = () => {
  return (
    <div className="text-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-backgroundLight rounded-full flex items-center justify-center">
          <Play className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-textPrimary mb-2">
            Nenhum vídeo disponível
          </h3>
          <p className="text-textSecondary">
            Esta solução ainda não possui vídeo-aulas cadastradas.
          </p>
        </div>
      </div>
    </div>
  );
};
