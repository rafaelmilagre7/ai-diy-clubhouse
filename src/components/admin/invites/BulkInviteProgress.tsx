import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Clock, Loader2, Mail, MessageCircle } from "lucide-react";
import { type BulkInviteProgress, type BulkInviteItem } from "@/hooks/admin/invites/useInviteBulkCreate";

interface BulkInviteProgressProps {
  isOpen: boolean;
  onClose: () => void;
  progress: BulkInviteProgress;
  onCancel?: () => void;
}

export function BulkInviteProgress({ 
  isOpen, 
  onClose, 
  progress,
  onCancel 
}: BulkInviteProgressProps) {
  const progressPercentage = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;

  const getStatusIcon = (item: BulkInviteItem) => {
    switch (item.status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-status-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-status-error" />;
      case 'creating':
      case 'sending':
        return <Loader2 className="h-4 w-4 text-status-info animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (item: BulkInviteItem) => {
    switch (item.status) {
      case 'pending':
        return 'Aguardando';
      case 'creating':
        return 'Criando convite';
      case 'sending':
        return 'Enviando';
      case 'success':
        return `Enviado via ${item.sentVia}`;
      case 'error':
        return item.error || 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  const getMethodIcon = (method?: string) => {
    if (!method) return null;
    
    if (method.includes('email')) {
      return <Mail className="h-3 w-3" />;
    }
    if (method.includes('whatsapp')) {
      return <MessageCircle className="h-3 w-3" />;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Progresso do Envio em Lote</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0">
          {/* Barra de Progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processando convites...</span>
              <span>{progress.processed}/{progress.total}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-status-success">{progress.successful}</div>
              <div className="text-sm text-muted-foreground">Sucessos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-status-error">{progress.failed}</div>
              <div className="text-sm text-muted-foreground">Falhas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-status-info">{progress.total - progress.processed}</div>
              <div className="text-sm text-muted-foreground">Pendentes</div>
            </div>
          </div>

          {/* Lista de Items */}
          <ScrollArea className="flex-1 min-h-0 border rounded-lg p-2">
            <div className="space-y-2">
              {progress.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIcon(item)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {item.contact.cleaned.email.split('@')[0]}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {item.contact.cleaned.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.sentVia && getMethodIcon(item.sentVia)}
                    <Badge 
                      variant={
                        item.status === 'success' ? 'default' :
                        item.status === 'error' ? 'destructive' :
                        'secondary'
                      }
                      className="shrink-0"
                    >
                      {getStatusText(item)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Botões de Ação */}
          <div className="flex justify-between pt-4 border-t">
            {progress.isRunning ? (
              <div className="flex items-center gap-2 text-status-info">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processando...</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {progress.successful > 0 && (
                  <span className="text-status-success">✓ {progress.successful} enviados com sucesso</span>
                )}
                {progress.failed > 0 && (
                  <span className="text-status-error ml-4">✗ {progress.failed} falharam</span>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              {progress.isRunning && onCancel && (
                <Button variant="outline" onClick={onCancel} size="sm">
                  Cancelar
                </Button>
              )}
              <Button 
                onClick={onClose} 
                size="sm"
                disabled={progress.isRunning}
              >
                {progress.isRunning ? 'Aguarde...' : 'Fechar'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}