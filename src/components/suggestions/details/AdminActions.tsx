
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Play, CheckCircle, RotateCcw, Trash2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
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
        <Button variant="outline" size="sm" disabled={adminActionLoading}>
          <MoreVertical className="h-4 w-4 mr-2" />
          Ações de Admin
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Opção: Marcar como Em Desenvolvimento */}
        <DropdownMenuItem 
          onClick={() => onUpdateStatus('in_development')}
          disabled={adminActionLoading || suggestionStatus === 'in_development'}
        >
          <Play className="mr-2 h-4 w-4" />
          {suggestionStatus === 'in_development' 
            ? 'Já em Desenvolvimento' 
            : 'Marcar como Em Desenvolvimento'}
        </DropdownMenuItem>

        {/* Opção: Marcar como Implementada */}
        <DropdownMenuItem 
          onClick={() => onUpdateStatus('implemented')}
          disabled={adminActionLoading || suggestionStatus === 'implemented'}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {suggestionStatus === 'implemented' 
            ? 'Já Implementada' 
            : 'Marcar como Implementada'}
        </DropdownMenuItem>

        {/* Opção: Marcar como Nova (reverter status) */}
        {(suggestionStatus === 'in_development' || suggestionStatus === 'implemented') && (
          <DropdownMenuItem 
            onClick={() => onUpdateStatus('new')}
            disabled={adminActionLoading}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Marcar como Nova
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        
        {/* Opção: Remover Sugestão */}
        <DropdownMenuItem 
          onClick={onOpenDeleteDialog}
          className="text-destructive focus:text-destructive"
          disabled={adminActionLoading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remover Sugestão
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
