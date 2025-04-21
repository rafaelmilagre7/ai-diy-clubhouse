
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface TrailLoadingStateProps {
  attemptCount: number;
  onForceRefresh: () => void;
}

export const TrailLoadingState: React.FC<TrailLoadingStateProps> = ({ attemptCount, onForceRefresh }) => (
  <div className="flex flex-col items-center justify-center space-y-4 h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]" />
    <p className="text-[#0ABAB5] font-medium">Carregando sua trilha personalizada...</p>
    {attemptCount > 2 && (
      <Button
        variant="outline"
        onClick={onForceRefresh}
        size="sm"
        className="mt-4"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Forçar recarregamento
      </Button>
    )}
  </div>
);
