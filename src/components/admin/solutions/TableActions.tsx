
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
        <Button variant="ghost" size="icon" className="text-neutral-300 hover:text-white">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#1A1E2E] border-neutral-700 text-white">
        <DropdownMenuItem className="hover:bg-neutral-800 text-white cursor-pointer" onClick={onEdit}>
          <FileEdit className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>
        <Link to={`/solution/${solutionId}`} target="_blank">
          <DropdownMenuItem className="hover:bg-neutral-800 text-white cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            <span>Visualizar</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem 
          className="hover:bg-neutral-800 text-white cursor-pointer"
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
