
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, FileEdit, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TableActionsProps {
  solutionId: string;
  onEdit: () => void;
  onDelete: () => void;
  onDeleteClick?: (id: string) => void; // Manter compatibilidade
}

export const TableActions: React.FC<TableActionsProps> = ({
  solutionId,
  onEdit,
  onDelete,
  onDeleteClick
}) => {
  const handleDelete = () => {
    if (onDeleteClick) {
      onDeleteClick(solutionId);
    } else {
      onDelete();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border text-popover-foreground">
        <DropdownMenuItem className="hover:bg-surface-elevated text-foreground cursor-pointer" onClick={onEdit}>
          <FileEdit className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>
        <Link to={`/solution/${solutionId}`} target="_blank">
          <DropdownMenuItem className="hover:bg-surface-elevated text-foreground cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            <span>Visualizar</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem 
          className="hover:bg-surface-elevated text-foreground cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            handleDelete();
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Excluir</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
