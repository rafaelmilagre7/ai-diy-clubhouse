
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface TrailLoadingStateProps {
  onForceRefresh: () => void;
}

export const TrailLoadingState: React.FC<TrailLoadingStateProps> = ({ 
  onForceRefresh
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]" />
      
      <p className="text-[#0ABAB5] font-medium text-center">
        Carregando sua trilha personalizada...
      </p>
      
      <Button
        variant="outline"
        onClick={onForceRefresh}
        size="sm"
        className="mt-4"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Forçar recarregamento
      </Button>
      
      <div className="mt-4 text-sm text-gray-600 max-w-md text-center">
        Se o carregamento persistir, você pode voltar ao Dashboard e tentar novamente mais tarde.
      </div>
    </div>
  );
};
