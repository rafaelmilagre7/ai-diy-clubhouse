
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, FileEdit, Eye, Trash2 } from 'lucide-react';
import { Text } from '@/components/ui/text';
import { Link } from 'react-router-dom';

interface TableActionsProps {
  solutionId: string;
  onDeleteClick: (id: string) => void;
}

export const TableActions: React.FC<TableActionsProps> = ({
  solutionId,
  onDeleteClick
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-text-secondary hover:text-primary">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-surface-elevated border-border">
        <Link to={`/admin/solutions/${solutionId}`}>
          <DropdownMenuItem className="hover:bg-surface-hover cursor-pointer">
            <FileEdit className="mr-2 h-4 w-4" />
            <Text variant="body-small" textColor="primary">Editar</Text>
          </DropdownMenuItem>
        </Link>
        <Link to={`/solution/${solutionId}`} target="_blank">
          <DropdownMenuItem className="hover:bg-surface-hover cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            <Text variant="body-small" textColor="primary">Visualizar</Text>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem 
          className="hover:bg-surface-hover cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            onDeleteClick(solutionId);
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <Text variant="body-small" textColor="primary">Excluir</Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
