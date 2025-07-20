
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Flag, Pin, Lock } from "lucide-react";

interface ModerationActionsProps {
  type: "topic" | "post";
  itemId: string;
  currentState: {
    isPinned?: boolean;
    isLocked?: boolean;
    isHidden?: boolean;
  };
  onReport: () => void;
  onSuccess?: () => void;
}

export const ModerationActions = ({
  type,
  itemId,
  currentState,
  onReport,
  onSuccess
}: ModerationActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onReport}>
          <Flag className="h-4 w-4 mr-2" />
          Reportar
        </DropdownMenuItem>
        
        {type === "topic" && (
          <>
            <DropdownMenuItem>
              <Pin className="h-4 w-4 mr-2" />
              {currentState.isPinned ? "Desafixar" : "Fixar"}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Lock className="h-4 w-4 mr-2" />
              {currentState.isLocked ? "Destravar" : "Travar"}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
