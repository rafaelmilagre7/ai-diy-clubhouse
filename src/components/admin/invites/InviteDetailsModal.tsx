import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Mail, 
  CheckCircle, 
  Eye, 
  MousePointerClick,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  RefreshCw
} from "lucide-react";
import { showModernSuccess } from '@/lib/toast-helpers';
import { Skeleton } from "@/components/ui/skeleton";
import type { Invite } from "@/hooks/admin/invites/types";

interface InviteDetailsModalProps {
  invite: Invite | null;
  isOpen: boolean;
  onClose: () => void;
  onResend?: (invite: Invite) => void;
}

const EVENT_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  sent: { icon: Mail, label: 'Enviado', color: 'text-tracking-sent' },
  delivered: { icon: CheckCircle, label: 'Entregue', color: 'text-tracking-delivered' },
  opened: { icon: Eye, label: 'Aberto', color: 'text-tracking-opened' },
  clicked: { icon: MousePointerClick, label: 'Clicado', color: 'text-tracking-clicked' },
  bounced: { icon: XCircle, label: 'Rejeitado', color: 'text-tracking-bounced' },
  delivery_delayed: { icon: Clock, label: 'Atrasado', color: 'text-status-warning' },
};

export function InviteDetailsModal({ invite, isOpen, onClose, onResend }: InviteDetailsModalProps) {
  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['invite-events', invite?.id],
    queryFn: async () => {
      if (!invite?.id) return [];
      
      const { data, error } = await supabase
        .from('invite_delivery_events')
        .select('*')
        .eq('invite_id', invite.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!invite?.id && isOpen,
  });

  if (!invite) return null;

  const inviteUrl = `${window.location.origin}/convite/${invite.token}`;
  const isExpired = new Date(invite.expires_at) < new Date();
  const isUsed = !!invite.used_at;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showModernSuccess(`${label} copiado!`, 'Colado na área de transferência');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Mail className="h-6 w-6 text-aurora" />
            Detalhes do Convite
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-semibold">{invite.email}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(invite.email, 'Email')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Papel</p>
                <p className="font-semibold mt-1">{invite.role?.name || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">
                  {isUsed ? (
                    <Badge className="bg-status-success/10 text-status-success border-status-success/20">
                      ✓ Ativo
                    </Badge>
                  ) : isExpired ? (
                    <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                      ⌛ Expirado
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                      ⏳ Pendente
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expira em</p>
                <p className="font-semibold mt-1">
                  {format(new Date(invite.expires_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>

            {invite.email_id && (
              <div>
                <p className="text-sm text-muted-foreground">ID do Email (Resend)</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {invite.email_id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(invite.email_id!, 'ID')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Link do Convite</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1 truncate">
                  {inviteUrl}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(inviteUrl, 'Link')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(inviteUrl, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {invite.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Observações</p>
                <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{invite.notes}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Timeline de Eventos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Timeline de Eventos
                {events && events.length > 0 && (
                  <Badge variant="outline">{events.length} eventos</Badge>
                )}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : events && events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event: any, index: number) => {
                  const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.sent;
                  const Icon = config.icon;
                  
                  return (
                    <div
                      key={event.id}
                      className="flex gap-4 p-4 rounded-lg border border-aurora/10 bg-aurora/5 hover:bg-aurora/10 transition-colors"
                    >
                      <div className={`p-2 rounded-lg bg-background ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{config.label}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {format(new Date(event.created_at), "dd/MM HH:mm:ss", { locale: ptBR })}
                          </p>
                        </div>
                        {event.event_data && Object.keys(event.event_data).length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {JSON.stringify(event.event_data, null, 2)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-aurora/20 rounded-lg">
                <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum evento registrado ainda</p>
                <p className="text-xs mt-1">
                  Os eventos aparecerão aqui após o envio do email
                </p>
              </div>
            )}
          </div>

          {/* Estatísticas */}
          {invite.send_attempts && invite.send_attempts > 0 && (
            <>
              <Separator />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-aurora">{invite.send_attempts}</p>
                  <p className="text-xs text-muted-foreground">Tentativas de Envio</p>
                </div>
                {invite.last_sent_at && (
                  <div>
                    <p className="text-sm font-semibold">
                      {format(new Date(invite.last_sent_at), "dd/MM HH:mm", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-muted-foreground">Último Envio</p>
                  </div>
                )}
                <div>
                  <p className="text-2xl font-bold text-status-success">
                    {events?.filter((e: any) => e.event_type === 'delivered').length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Entregas</p>
                </div>
              </div>
            </>
          )}

          {/* Ações */}
          <div className="flex gap-2">
            {onResend && !isUsed && (
              <Button
                onClick={() => {
                  onResend(invite);
                  onClose();
                }}
                className="flex-1 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reenviar Convite
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
