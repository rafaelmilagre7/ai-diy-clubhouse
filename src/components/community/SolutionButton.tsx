
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SolutionButtonProps {
  isSolved: boolean;
  isSubmitting: boolean;
  canMarkAsSolved: boolean;
  onMarkAsSolved: () => void;
  onUnmarkAsSolved: () => void;
  postId?: string;
}

export function SolutionButton({
  isSolved,
  isSubmitting,
  canMarkAsSolved,
  onMarkAsSolved,
  onUnmarkAsSolved,
  postId
}: SolutionButtonProps) {
  if (!canMarkAsSolved) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isSolved ? "outline" : "ghost"}
            size="sm"
            className={isSolved ? "text-operational border-operational/30" : "text-muted-foreground"}
            onClick={() => isSolved ? onUnmarkAsSolved() : onMarkAsSolved()}
            disabled={isSubmitting}
          >
            {isSolved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span>Solução</span>
              </>
            ) : (
              <>
                <HelpCircle className="h-4 w-4 mr-1" />
                <span>Marcar como solução</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isSolved ? "Remover como solução" : "Marcar esta resposta como solução"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
