import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { BatchProgress } from "@/hooks/admin/invites/useBatchSendInvites";

interface BatchSendProgressProps {
  progress: BatchProgress[];
  isProcessing: boolean;
}

export function BatchSendProgress({ progress, isProcessing }: BatchSendProgressProps) {
  if (progress.length === 0 && !isProcessing) return null;

  const initData = progress.find(p => p.type === 'init');
  const completeData = progress.find(p => p.type === 'complete');
  
  const total = initData?.total || 0;
  const processed = progress.filter(p => 
    p.type === 'invite_success' || p.type === 'invite_failed'
  ).length;
  
  const successful = progress.filter(p => p.type === 'invite_success').length;
  const failed = progress.filter(p => p.type === 'invite_failed').length;
  const retrying = progress.filter(p => p.type === 'invite_retry').length;

  const progressPercent = total > 0 ? (processed / total) * 100 : 0;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'invite_success':
        return <CheckCircle2 className="h-4 w-4 text-status-success" />;
      case 'invite_failed':
        return <XCircle className="h-4 w-4 text-status-error" />;
      case 'invite_retry':
        return <RefreshCw className="h-4 w-4 text-status-warning" />;
      case 'invite_processing':
        return <Loader2 className="h-4 w-4 text-status-info animate-spin" />;
      case 'batch_start':
        return <AlertCircle className="h-4 w-4 text-status-info" />;
      default:
        return null;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'invite_success':
        return 'text-status-success';
      case 'invite_failed':
        return 'text-status-error';
      case 'invite_retry':
        return 'text-status-warning';
      case 'invite_processing':
        return 'text-status-info';
      case 'batch_start':
      case 'batch_complete':
        return 'text-primary font-semibold';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatEventMessage = (event: BatchProgress) => {
    const time = new Date(event.timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    switch (event.type) {
      case 'init':
        return `[${time}] 🚀 Iniciando envio em lote de ${event.total} convites`;
      
      case 'batch_start':
        return `[${time}] 📦 Processando lote ${event.batch}/${event.totalBatches} (${event.size} convites)`;
      
      case 'batch_complete':
        return `[${time}] ✓ Lote concluído - ${event.processed}/${event.total} processados`;
      
      case 'invite_processing':
        return `[${time}] ⏳ Enviando para ${event.email} (tentativa ${event.attempt}/${event.maxRetries})`;
      
      case 'invite_success':
        return `[${time}] ✅ Sucesso: ${event.email}`;
      
      case 'invite_retry':
        return `[${time}] 🔄 Reenvio: ${event.email} - ${event.error}`;
      
      case 'invite_failed':
        return `[${time}] ❌ Falha: ${event.email} - ${event.error}`;
      
      case 'complete':
        return `[${time}] 🎉 Processamento concluído! ${event.successful} sucesso, ${event.failed} falhas`;
      
      case 'error':
        return `[${time}] ❌ Erro: ${event.error}`;
      
      default:
        return `[${time}] ${event.type}`;
    }
  };

  return (
    <Card className="p-6 space-y-4">
      {/* Header com estatísticas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-status-info" />
                Processando Envio em Lote
              </>
            ) : completeData ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-status-success" />
                Envio Concluído
              </>
            ) : (
              'Envio em Lote'
            )}
          </h3>
          
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-status-success/10 text-status-success border-status-success/20">
              ✓ {successful}
            </Badge>
            {retrying > 0 && (
              <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning/20">
                🔄 {retrying}
              </Badge>
            )}
            {failed > 0 && (
              <Badge variant="outline" className="bg-status-error/10 text-status-error border-status-error/20">
                ✗ {failed}
              </Badge>
            )}
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-1">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {processed} de {total} convites processados ({Math.round(progressPercent)}%)
          </p>
        </div>
      </div>

      {/* Log de eventos em tempo real */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          📋 Log de Processamento
        </h4>
        
        <ScrollArea className="h-[300px] rounded-md border bg-muted/30 p-4">
          <div className="space-y-1 font-mono text-xs">
            {progress.map((event, index) => (
              <div 
                key={index}
                className={`flex items-start gap-2 ${getEventColor(event.type)}`}
              >
                <span className="mt-0.5 flex-shrink-0">
                  {getEventIcon(event.type)}
                </span>
                <span className="break-all">
                  {formatEventMessage(event)}
                </span>
              </div>
            ))}
            
            {isProcessing && progress.length === 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Inicializando processamento...</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Resumo final */}
      {completeData && (
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <h4 className="font-semibold text-sm">📊 Resumo Final</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{completeData.total}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sucesso</p>
              <p className="text-2xl font-bold text-status-success">{completeData.successful}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Falhas</p>
              <p className="text-2xl font-bold text-status-error">{completeData.failed}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
