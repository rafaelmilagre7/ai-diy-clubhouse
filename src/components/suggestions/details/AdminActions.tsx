
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, CheckCircle, Trash2, Clock, XCircle } from 'lucide-react';
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
        {/* Opção: Marcar como Em Análise */}
        <DropdownMenuItem 
          onClick={() => onUpdateStatus('under_review')}
          disabled={adminActionLoading || suggestionStatus === 'under_review'}
        >
          <Eye className="mr-2 h-4 w-4" />
          {suggestionStatus === 'under_review' 
            ? 'Já em Análise' 
            : 'Marcar como Em Análise'}
        </DropdownMenuItem>

        {/* Opção: Aprovar */}
        <DropdownMenuItem 
          onClick={() => onUpdateStatus('approved')}
          disabled={adminActionLoading || suggestionStatus === 'approved'}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {suggestionStatus === 'approved' 
            ? 'Já Aprovada' 
            : 'Aprovar Sugestão'}
        </DropdownMenuItem>

        {/* Opção: Marcar como Em Desenvolvimento */}
        <DropdownMenuItem 
          onClick={() => onUpdateStatus('in_development')}
          disabled={adminActionLoading || suggestionStatus === 'in_development'}
        >
          <Clock className="mr-2 h-4 w-4" />
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
        {(suggestionStatus !== 'new') && (
          <DropdownMenuItem 
            onClick={() => onUpdateStatus('new')}
            disabled={adminActionLoading}
          >
            <Clock className="mr-2 h-4 w-4" />
            Marcar como Nova
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        
        {/* Opção: Rejeitar */}
        <DropdownMenuItem 
          onClick={() => onUpdateStatus('rejected')}
          disabled={adminActionLoading || suggestionStatus === 'rejected'}
          className="text-destructive focus:text-destructive"
        >
          <XCircle className="mr-2 h-4 w-4" />
          {suggestionStatus === 'rejected' 
            ? 'Já Rejeitada' 
            : 'Rejeitar Sugestão'}
        </DropdownMenuItem>
        
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
