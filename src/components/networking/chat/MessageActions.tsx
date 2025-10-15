import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Reply, Edit, Trash, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface MessageActionsProps {
  messageId: string;
  content: string;
  isOwn: boolean;
  canEdit: boolean;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const MessageActions = ({
  messageId,
  content,
  isOwn,
  canEdit,
  onReply,
  onEdit,
  onDelete,
}: MessageActionsProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success('Mensagem copiada');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={onReply}>
          <Reply className="w-4 h-4 mr-2" />
          Responder
        </DropdownMenuItem>
        
        {isOwn && canEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2" />
          Copiar
        </DropdownMenuItem>
        
        {isOwn && (
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash className="w-4 h-4 mr-2" />
            Deletar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
