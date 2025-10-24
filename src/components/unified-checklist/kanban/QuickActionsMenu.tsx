import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Copy, Tag, Trash2 } from "lucide-react";
import { UnifiedChecklistItem } from "@/hooks/useUnifiedChecklists";

interface QuickActionsMenuProps {
  item: UnifiedChecklistItem;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddLabel: () => void;
}

export const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  item,
  onEdit,
  onDuplicate,
  onDelete,
  onAddLabel
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Menu de ações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}>
          <Edit className="h-4 w-4 mr-2" />
          Ver detalhes completos
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onAddLabel();
        }}>
          <Tag className="h-4 w-4 mr-2" />
          Gerenciar labels
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}>
          <Copy className="h-4 w-4 mr-2" />
          Duplicar card
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }} 
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Deletar card
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
