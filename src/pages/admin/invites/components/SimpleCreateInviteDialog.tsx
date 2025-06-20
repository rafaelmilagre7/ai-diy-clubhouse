
import { useState } from "react";
import { Loader2, Plus, Clock, Mail, CheckCircle, RefreshCw, AlertTriangle, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInviteCreate } from "@/hooks/admin/invites/useInviteCreate";

interface SimpleCreateInviteDialogProps {
  roles: any[];
  onInviteCreated: () => void;
}

const SimpleCreateInviteDialog = ({ roles, onInviteCreated }: SimpleCreateInviteDialogProps) => {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);
  const { createInvite, loading, currentStep, isCreating, isSending, isRetrying } = useInviteCreate();
  const [processDetails, setProcessDetails] = useState<{
    strategy?: string;
    attempts?: number;
    responseTime?: number;
    fallbackUsed?: boolean;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !roleId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    setProcessDetails({});
    
    try {
      const result = await createInvite({
        email,
        roleId,
        notes
      });
      
      if (result) {
        // Capturar detalhes do processo
        if (result.emailResult) {
          setProcessDetails({
            strategy: result.emailResult.strategy,
            attempts: 1,
            fallbackUsed: result.emailResult.strategy !== 'resend_primary'
          });
        }

        setEmail("");
        setRoleId("");
        setNotes("");
        setOpen(false);
        onInviteCreated();
        
        if (result.status === 'success') {
          toast.success(`Convite enviado para ${email} com sucesso!`, {
            description: `Método: ${result.emailResult?.strategy || 'Sistema principal'}`
          });
        } else if (result.status === 'partial_success') {
          toast.warning(`Convite criado para ${email}, mas email não foi enviado automaticamente.`, {
            description: result.suggestion || 'Use o botão "Reenviar" para tentar novamente.',
            duration: 8000
          });
        }
      }
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      setProcessDetails({ fallbackUsed: true });
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 'creating':
        return <Clock className="mr-2 h-4 w-4 animate-pulse text-blue-500" />;
      case 'sending':
        return <Mail className="mr-2 h-4 w-4 animate-pulse text-orange-500" />;
      case 'retrying':
        return <RefreshCw className="mr-2 h-4 w-4 animate-spin text-yellow-500" />;
      case 'complete':
        return <CheckCircle className="mr-2 h-4 w-4 text-green-500" />;
      default:
        return <Plus className="mr-2 h-4 w-4" />;
    }
  };

  const getButtonText = () => {
    if (isCreating) return "Criando convite...";
    if (isSending) return "Enviando email...";
    if (isRetrying) return "Tentando sistema alternativo...";
    if (loading) return "Processando...";
    return "Criar Convite";
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'creating':
        return "Criando convite no banco de dados...";
      case 'sending':
        return "Enviando email via sistema principal (Resend)...";
      case 'retrying':
        return "Sistema principal falhou. Tentando métodos alternativos...";
      case 'complete':
        return "Convite criado e enviado com sucesso!";
      default:
        return "";
    }
  };

  const getProcessBadge = () => {
    if (!processDetails.strategy) return null;

    const strategyLabels = {
      'resend_primary': { label: 'Sistema Principal', color: 'default' },
      'supabase_auth': { label: 'Sistema Alternativo', color: 'secondary' },
      'fallback_recovery': { label: 'Recuperação', color: 'destructive' }
    };

    const strategy = strategyLabels[processDetails.strategy] || { label: 'Desconhecido', color: 'outline' };

    return (
      <Badge variant={strategy.color as any} className="ml-2">
        {strategy.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Convite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Novo Convite</DialogTitle>
            <DialogDescription>
              Envie um convite para novos membros acessarem a plataforma.
            </DialogDescription>
          </DialogHeader>
          
          {/* Status detalhado do processo */}
          {loading && (
            <Card className="bg-blue-50 border border-blue-200 mb-4">
              <CardContent className="p-3">
                <div className="flex items-center text-sm text-blue-800">
                  {getStepIcon()}
                  <span className="flex-1">{getStepDescription()}</span>
                  {processDetails.strategy && getProcessBadge()}
                </div>
                
                {isRetrying && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-yellow-700">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Sistema implementando fallback automático para garantir entrega</span>
                  </div>
                )}

                {processDetails.fallbackUsed && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-orange-700">
                    <Zap className="h-3 w-3" />
                    <span>Sistema de backup ativado automaticamente</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Papel</Label>
              <Select value={roleId} onValueChange={setRoleId} required disabled={loading}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Informações adicionais sobre o convite"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {getButtonText()}
                </>
              ) : (
                "Criar Convite"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleCreateInviteDialog;
