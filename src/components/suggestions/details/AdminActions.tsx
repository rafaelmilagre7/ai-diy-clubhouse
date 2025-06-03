
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Play, Trash2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface AdminActionsProps {
  adminActionLoading: boolean;
  suggestionStatus: string;
  onUpdateStatus: (status: string) => void;
  onOpenDeleteDialog: () => void;
}

export const AdminActions = ({
  adminActionLoading,
  suggestionStatus,
  onUpdateStatus,
  onOpenDeleteDialog
}: AdminActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreVertical className="h-4 w-4 mr-2" />
          Ações de Admin
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => onUpdateStatus('in_development')}
          disabled={adminActionLoading || suggestionStatus === 'in_development'}
        >
          <Play className="mr-2 h-4 w-4" />
          {suggestionStatus === 'in_development' 
            ? 'Já em Desenvolvimento' 
            : 'Marcar como Em Desenvolvimento'}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onOpenDeleteDialog}
          className="text-destructive"
          disabled={adminActionLoading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remover Sugestão
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
