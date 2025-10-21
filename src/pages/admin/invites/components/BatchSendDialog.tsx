import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Invite } from "@/hooks/admin/invites/types";
import { useBatchSendInvites } from "@/hooks/admin/invites";
import { BatchSendProgress } from "@/components/admin/invites/BatchSendProgress";
import { Send, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BatchSendDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedInvites: Invite[];
  onComplete?: () => void;
}

export function BatchSendDialog({
  isOpen,
  onOpenChange,
  selectedInvites,
  onComplete
}: BatchSendDialogProps) {
  const { batchSend, isProcessing, progress, summary, clearProgress } = useBatchSendInvites();
  const [maxRetries, setMaxRetries] = useState(3);
  const [parallelBatch, setParallelBatch] = useState(5);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSend = async () => {
    const inviteIds = selectedInvites.map(inv => inv.id);
    
    await batchSend({
      inviteIds,
      maxRetries,
      parallelBatch
    });

    if (onComplete) {
      onComplete();
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      clearProgress();
      onOpenChange(false);
    }
  };

  // Filtrar apenas convites ativos
  const activeInvites = selectedInvites.filter(
    inv => !inv.used_at && new Date(inv.expires_at) >= new Date()
  );

  const hasExpired = selectedInvites.some(
    inv => !inv.used_at && new Date(inv.expires_at) < new Date()
  );

  const hasUsed = selectedInvites.some(inv => inv.used_at);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Envio em Lote de Convites
          </DialogTitle>
          <DialogDescription>
            Envie múltiplos convites de uma vez com retry automático e processamento paralelo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações sobre os convites */}
          {progress.length === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 rounded-lg border bg-muted/50">
                <div className="flex-1">
                  <p className="font-medium">
                    {activeInvites.length} convite(s) selecionado(s)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Serão processados em lotes paralelos com retry automático
                  </p>
                </div>
                <Badge variant="default" className="text-lg px-4 py-2">
                  {activeInvites.length}
                </Badge>
              </div>

              {/* Avisos */}
              {hasExpired && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-status-warning/10 border border-status-warning/20">
                  <span className="text-status-warning">⚠️</span>
                  <p className="text-sm text-status-warning">
                    Alguns convites expirados foram ignorados. Apenas convites ativos serão enviados.
                  </p>
                </div>
              )}

              {hasUsed && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-status-info/10 border border-status-info/20">
                  <span className="text-status-info">ℹ️</span>
                  <p className="text-sm text-status-info">
                    Convites já utilizados foram ignorados.
                  </p>
                </div>
              )}

              {/* Configurações avançadas */}
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full justify-start"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {showAdvanced ? 'Ocultar' : 'Mostrar'} Configurações Avançadas
                </Button>

                {showAdvanced && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="maxRetries">
                        Tentativas Máximas
                        <span className="text-xs text-muted-foreground ml-2">
                          (1-5)
                        </span>
                      </Label>
                      <Input
                        id="maxRetries"
                        type="number"
                        min="1"
                        max="5"
                        value={maxRetries}
                        onChange={(e) => setMaxRetries(parseInt(e.target.value) || 3)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Número de tentativas antes de marcar como falha
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parallelBatch">
                        Lote Paralelo
                        <span className="text-xs text-muted-foreground ml-2">
                          (1-10)
                        </span>
                      </Label>
                      <Input
                        id="parallelBatch"
                        type="number"
                        min="1"
                        max="10"
                        value={parallelBatch}
                        onChange={(e) => setParallelBatch(parseInt(e.target.value) || 5)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Quantos convites processar simultaneamente
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isProcessing}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={isProcessing || activeInvites.length === 0}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Iniciar Envio
                </Button>
              </div>
            </div>
          )}

          {/* Progresso em tempo real */}
          <BatchSendProgress 
            progress={progress}
            isProcessing={isProcessing}
          />

          {/* Botão de fechar após conclusão */}
          {summary && !isProcessing && (
            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
