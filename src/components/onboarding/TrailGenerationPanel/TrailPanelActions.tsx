
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TrailPanelActions({
  onRegenerate,
  onClose
}: {
  onRegenerate: () => void;
  onClose?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap justify-between mt-6 gap-2">
      <Button 
        variant="ghost" 
        onClick={onRegenerate}
        className="flex items-center gap-1"
      >
        <RefreshCcw className="h-4 w-4 mr-1" />
        Regenerar Trilha
      </Button>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => navigate("/onboarding/review")}
          className="flex items-center gap-1"
        >
          <Edit className="h-4 w-4 mr-1" /> 
          Editar Onboarding
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        )}
      </div>
    </div>
  );
}
