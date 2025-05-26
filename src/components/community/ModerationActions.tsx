
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { useDeleteConfirmation } from "@/hooks/community/useDeleteConfirmation";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useModeration } from "@/hooks/admin/useModeration";
import { 
  MoreHorizontal, 
  Pin, 
  PinOff, 
  Lock, 
  Unlock, 
  EyeOff, 
  Eye, 
  Trash2,
  Flag,
  Shield
} from "lucide-react";
import { toast } from "sonner";

interface ModerationActionsProps {
  type: 'topic' | 'post';
  itemId: string;
  currentState?: {
    isPinned?: boolean;
    isLocked?: boolean;
    isHidden?: boolean;
  };
  onReport?: () => void;
}

export const ModerationActions = ({ 
  type, 
  itemId, 
  currentState = {}, 
  onReport 
}: ModerationActionsProps) => {
  const { hasPermission } = usePermissions();
  const { performModerationAction } = useModeration();
  const {
    isOpen,
    isDeleting,
    pendingAction,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete
  } = useDeleteConfirmation();
  
  const canModerate = hasPermission('community.moderate');
  const canReport = true; // Qualquer usuário pode reportar

  const handleAction = async (actionType: string, reason: string) => {
    try {
      await performModerationAction({
        action_type: actionType as any,
        [type === 'topic' ? 'topic_id' : 'post_id']: itemId,
        reason
      });
    } catch (error) {
      console.error('Erro na ação de moderação:', error);
    }
  };

  const handleDelete = () => {
    const deleteAction = async () => {
      await handleAction('delete', 'Conteúdo removido por moderação');
      toast.success(`${type === 'topic' ? 'Tópico' : 'Post'} excluído com sucesso`);
    };

    openDeleteDialog({
      type,
      itemId,
      action: deleteAction,
      title: `Excluir ${type === 'topic' ? 'tópico' : 'resposta'}`,
      description: `Tem certeza que deseja excluir ${type === 'topic' ? 'este tópico' : 'esta resposta'}? Esta ação não pode ser desfeita e todo o conteúdo será removido permanentemente.`
    });
  };

  const actions = [
    // Ações para usuários comuns
    ...(onReport ? [{
      icon: Flag,
      label: 'Reportar',
      action: () => onReport(),
      show: canReport,
      variant: 'default' as const
    }] : []),
    
    // Separador se houver ações de usuário e moderação
    ...(canReport && canModerate ? [{ separator: true }] : []),
    
    // Ações de moderação
    ...(canModerate ? [
      {
        icon: currentState.isPinned ? PinOff : Pin,
        label: currentState.isPinned ? 'Desafixar' : 'Fixar',
        action: () => handleAction(currentState.isPinned ? 'unpin' : 'pin', 'Ação de moderação'),
        show: type === 'topic',
        variant: 'default' as const
      },
      {
        icon: currentState.isLocked ? Unlock : Lock,
        label: currentState.isLocked ? 'Destravar' : 'Travar',
        action: () => handleAction(currentState.isLocked ? 'unlock' : 'lock', 'Ação de moderação'),
        show: type === 'topic',
        variant: 'default' as const
      },
      {
        icon: currentState.isHidden ? Eye : EyeOff,
        label: currentState.isHidden ? 'Mostrar' : 'Ocultar',
        action: () => handleAction(currentState.isHidden ? 'unhide' : 'hide', 'Ação de moderação'),
        show: true,
        variant: 'default' as const
      },
      { separator: true },
      {
        icon: Trash2,
        label: 'Excluir',
        action: handleDelete,
        show: true,
        variant: 'destructive' as const
      }
    ] : [])
  ];

  const visibleActions = actions.filter(action => 
    'separator' in action || action.show !== false
  );

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {visibleActions.map((action, index) => {
            if ('separator' in action) {
              return <DropdownMenuSeparator key={index} />;
            }

            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={index}
                onClick={action.action}
                className={`flex items-center gap-2 ${
                  action.variant === 'destructive' 
                    ? 'text-red-600 focus:text-red-600' 
                    : ''
                }`}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmationDialog
        isOpen={isOpen}
        onClose={closeDeleteDialog}
        onDelete={confirmDelete}
        isDeleting={isDeleting}
        title={pendingAction?.title}
        description={pendingAction?.description}
      />
    </>
  );
};
