
import React from 'react';
import { MoreHorizontal, Flag, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModerationActionsProps {
  type: 'post' | 'topic';
  itemId: string;
  currentState: {
    isHidden: boolean;
  };
  onReport: () => void;
}

export const ModerationActions: React.FC<ModerationActionsProps> = ({
  type,
  itemId,
  currentState,
  onReport
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onReport}>
          <Flag className="mr-2 h-4 w-4" />
          Reportar
        </DropdownMenuItem>
        {currentState.isHidden ? (
          <DropdownMenuItem>
            <Eye className="mr-2 h-4 w-4" />
            Mostrar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <EyeOff className="mr-2 h-4 w-4" />
            Ocultar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
