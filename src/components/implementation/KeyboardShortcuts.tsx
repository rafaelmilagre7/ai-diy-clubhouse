
import React from "react";
import { Keyboard } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

export const KeyboardShortcuts = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="hidden sm:flex items-center text-sm text-muted-foreground">
            <Keyboard className="h-4 w-4 mr-1" />
            <span>Use as setas ← → para navegar</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tecla de atalho: ESC para sair</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
