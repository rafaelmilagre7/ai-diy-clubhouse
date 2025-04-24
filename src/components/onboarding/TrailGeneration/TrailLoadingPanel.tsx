
import React from "react";
import { Loader2 } from "lucide-react";

interface TrailLoadingPanelProps {
  regenerating: boolean;
  refreshing: boolean;
  attemptCount: number;
  onRefreshTrail: () => void;
}

export const TrailLoadingPanel = ({ 
  regenerating, 
  refreshing, 
  attemptCount,
  onRefreshTrail 
}: TrailLoadingPanelProps) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-center items-center h-40">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-t-[#0ABAB5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-[#0ABAB5] font-medium">
            {regenerating 
              ? "Gerando nova trilha..." 
              : refreshing 
                ? "Atualizando trilha personalizada..." 
                : "Carregando trilha personalizada..."}
          </p>
          {attemptCount > 2 && (
            <button 
              onClick={onRefreshTrail}
              className="mt-4 text-sm text-gray-500 hover:text-[#0ABAB5] underline"
            >
              Este processo está demorando. Clique para tentar novamente.
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
