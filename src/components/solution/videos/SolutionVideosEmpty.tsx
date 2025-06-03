
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";

export const SolutionVideosEmpty = () => {
  return (
    <Card className="border-white/10">
      <CardContent className="p-8 text-center">
        <PlayCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2 text-textPrimary">
          Nenhum vídeo disponível
        </h3>
        <p className="text-textSecondary">
          Esta solução não possui vídeos tutoriais específicos.
        </p>
      </CardContent>
    </Card>
  );
};
