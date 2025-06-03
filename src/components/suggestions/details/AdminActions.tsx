
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Play, Trash2, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
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
  
  const handleStatusUpdate = async (newStatus: string) => {
    console.log('AdminActions: Atualizando status para:', newStatus);
    try {
      await onUpdateStatus(newStatus);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={adminActionLoading}>
          <MoreVertical className="h-4 w-4 mr-2" />
          {adminActionLoading ? 'Processando...' : 'Ações de Admin'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        
        <DropdownMenuItem 
          onClick={() => handleStatusUpdate('under_review')}
          disabled={adminActionLoading || suggestionStatus === 'under_review'}
        >
          <Clock className="mr-2 h-4 w-4" />
          {suggestionStatus === 'under_review' 
            ? 'Já está em Análise' 
            : 'Marcar como Em Análise'}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleStatusUpdate('in_development')}
          disabled={adminActionLoading || suggestionStatus === 'in_development'}
        >
          <Play className="mr-2 h-4 w-4" />
          {suggestionStatus === 'in_development' 
            ? 'Já está em Desenvolvimento' 
            : 'Marcar como Em Desenvolvimento'}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleStatusUpdate('completed')}
          disabled={adminActionLoading || suggestionStatus === 'completed'}
          className="text-green-600 focus:text-green-600"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {suggestionStatus === 'completed' 
            ? 'Já está Implementada ✅' 
            : 'Marcar como Implementada'}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleStatusUpdate('declined')}
          disabled={adminActionLoading || suggestionStatus === 'declined'}
          className="text-red-600 focus:text-red-600"
        >
          <XCircle className="mr-2 h-4 w-4" />
          {suggestionStatus === 'declined' 
            ? 'Já foi Recusada' 
            : 'Marcar como Recusada'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
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
