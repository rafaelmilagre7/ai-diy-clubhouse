import React, { memo, useCallback } from 'react';
import { Invite } from '@/hooks/admin/invites/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Mail, MessageCircle, MoreHorizontal, RefreshCw, Trash2, Calendar, User, Clock, Copy } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { showModernError, showModernSuccess } from '@/lib/toast-helpers';
import { APP_CONFIG } from '@/config/app';

interface OptimizedInvitesListProps {
  invites: Invite[];
  onResend: (invite: Invite) => void;
  onDelete: (invite: Invite) => void;
  onReactivate: () => void;
  resendingInvites: Set<string>;
}

// Componente de item individual otimizado com memo
const InviteListItem = memo<{ 
  invite: Invite; 
  onResend: (invite: Invite) => void;
  onDelete: (invite: Invite) => void;
  isResending: boolean;
}>(({ invite, onResend, onDelete, isResending }) => {
  
  const handleResendClick = useCallback(() => {
    onResend(invite);
  }, [invite, onResend]);

  const handleDeleteClick = useCallback(() => {
    onDelete(invite);
  }, [invite, onDelete]);

  const copyInviteLink = useCallback(async () => {
    const inviteUrl = APP_CONFIG.getAppUrl(`/convite/${invite.token}`);
    try {
      await navigator.clipboard.writeText(inviteUrl);
      showModernSuccess('Link copiado!', 'Convite pronto para compartilhar');
    } catch (error) {
      showModernError('Erro ao copiar', 'Tente novamente');
    }
  }, [invite.token]);

  const getStatusBadge = useCallback(() => {
    const isUsed = !!invite.used_at;
    const isExpired = !isUsed && new Date(invite.expires_at) <= new Date();
    const isActive = !isUsed && !isExpired;
    
    // Detectar convites falhados
    const isFailed = (invite as any).delivery_status === 'failed' || 
                    ((invite as any).send_attempts && (invite as any).send_attempts > 3) ||
                    ((invite as any).last_error && !isUsed);
    
    if (isFailed) {
      return <Badge variant="destructive" className="text-xs">❌ Falhado</Badge>;
    }
    
    if (isUsed) {
      return <Badge variant="default" className="bg-status-success-lighter text-status-success border-status-success/30 text-xs">✅ Usado</Badge>;
    }
    
    if (isExpired) {
      return <Badge variant="secondary" className="bg-status-warning-lighter text-status-warning border-status-warning/30 text-xs">⏰ Expirado</Badge>;
    }
    
    if (isActive) {
      return <Badge variant="outline" className="bg-status-info-lighter text-status-info border-status-info/30 text-xs">🟢 Ativo</Badge>;
    }
    
    return null;
  }, [invite]);

  const getChannelIcon = useCallback(() => {
    const channel = invite.preferred_channel;
    if (channel === 'whatsapp') return <MessageCircle className="h-3 w-3 text-tracking-delivered" />;
    if (channel === 'both') return <div className="flex gap-1"><Mail className="h-3 w-3 text-tracking-sent" /><MessageCircle className="h-3 w-3 text-tracking-delivered" /></div>;
    return <Mail className="h-3 w-3 text-tracking-sent" />;
  }, [invite.preferred_channel]);

  return (
    <div className="flex items-center justify-between p-4 border-b border-muted/20 hover:bg-muted/30 transition-colors duration-base">
      <div className="flex-1 min-w-0 space-y-2">
        {/* Linha principal - Email e Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {getChannelIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{invite.email}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{invite.role?.name || 'Papel não definido'}</span>
              </div>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Linha secundária - Datas e informações */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Criado {formatDistanceToNow(new Date(invite.created_at), { locale: ptBR, addSuffix: true })}</span>
          </div>
          
          {invite.used_at ? (
            <div className="flex items-center gap-1 text-status-success">
              <Clock className="h-3 w-3" />
              <span>Usado {formatDistanceToNow(new Date(invite.used_at), { locale: ptBR, addSuffix: true })}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Expira em {format(new Date(invite.expires_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
            </div>
          )}
          
          {invite.creator_name && (
            <span>por {invite.creator_name}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4">
        <TooltipProvider>
          {/* Botão Copiar Link - sempre visível */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={copyInviteLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copiar link do convite</p>
            </TooltipContent>
          </Tooltip>

          {/* Botão Deletar - sempre visível */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={handleDeleteClick}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Deletar convite</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Dropdown para ações secundárias */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleResendClick} disabled={isResending}>
              {isResending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Reenviar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

InviteListItem.displayName = 'InviteListItem';

// Lista principal otimizada
export const OptimizedInvitesList = memo<OptimizedInvitesListProps>(({ 
  invites, 
  onResend, 
  onDelete, 
  onReactivate, 
  resendingInvites 
}) => {
  if (invites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 aurora-glass rounded-full border-4 border-aurora/30 flex items-center justify-center mb-6">
          <Mail className="h-8 w-8 text-aurora/70" />
        </div>
        <h3 className="text-lg font-semibold aurora-text-gradient mb-2">Nenhum convite encontrado</h3>
        <p className="text-muted-foreground max-w-sm">
          Não há convites que correspondam aos filtros selecionados. Tente ajustar os critérios de busca.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-muted/10">
      {invites.map((invite) => (
        <InviteListItem
          key={invite.id}
          invite={invite}
          onResend={onResend}
          onDelete={onDelete}
          isResending={resendingInvites.has(invite.id)}
        />
      ))}
    </div>
  );
});

OptimizedInvitesList.displayName = 'OptimizedInvitesList';

export default OptimizedInvitesList;