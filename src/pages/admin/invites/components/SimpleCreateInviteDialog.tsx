
import { useState } from "react";
import { Loader2, Plus, AlertCircle, RefreshCw, Settings } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInviteCreate } from "@/hooks/admin/invites/useInviteCreate";
import { useInviteEmailFallback } from "@/hooks/admin/invites/useInviteEmailFallback";
import { ResendConfigDialog } from "@/components/admin/invites/ResendConfigDialog";

interface SimpleCreateInviteDialogProps {
  roles: any[];
  onInviteCreated: () => void;
}

const SimpleCreateInviteDialog = ({ roles, onInviteCreated }: SimpleCreateInviteDialogProps) => {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [notes, setNotes] = useState("");
  const [expiration, setExpiration] = useState("7 days");
  const [open, setOpen] = useState(false);
  const { createInvite, isCreating } = useInviteCreate();
  const { retryFailedInvites, isSending } = useInviteEmailFallback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !roleId) {
      console.warn("📝 [CREATE-INVITE-UI] Dados obrigatórios não preenchidos:", { email, roleId });
      return;
    }
    
    console.log("📝 [CREATE-INVITE-UI] Iniciando criação de convite pela UI:", {
      email,
      roleId,
      notes,
      expiration
    });
    
    const result = await createInvite(email, roleId, notes, expiration);
    
    console.log("📝 [CREATE-INVITE-UI] Resultado da criação:", { 
      success: !!result,
      inviteId: result?.invite_id 
    });
    
    if (result) {
      setEmail("");
      setRoleId("");
      setNotes("");
      setExpiration("7 days");
      setOpen(false);
      onInviteCreated();
    }
  };

  const handleRetryFailed = async () => {
    console.log("🔄 [CREATE-INVITE-UI] Tentando reenviar convites falhados...");
    await retryFailedInvites();
    onInviteCreated();
  };

  return (
    <div className="flex gap-2">
      <ResendConfigDialog />
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleRetryFailed}
        disabled={isSending}
        className="text-xs"
      >
        {isSending ? (
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        ) : (
          <RefreshCw className="mr-1 h-3 w-3" />
        )}
        Reenviar Falhados
      </Button>

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
                Envie um convite para novos membros. Sistema com envio robusto via Edge Functions.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  O sistema criará o convite e enviará automaticamente via Edge Function com fallback integrado.
                </AlertDescription>
              </Alert>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="role">Papel</Label>
                <Select value={roleId} onValueChange={setRoleId} required>
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
                <Label htmlFor="expiration">Expira em</Label>
                <Select value={expiration} onValueChange={setExpiration}>
                  <SelectTrigger id="expiration">
                    <SelectValue placeholder="Período de expiração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 day">1 dia</SelectItem>
                    <SelectItem value="3 days">3 dias</SelectItem>
                    <SelectItem value="7 days">7 dias</SelectItem>
                    <SelectItem value="14 days">14 dias</SelectItem>
                    <SelectItem value="30 days">30 dias</SelectItem>
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
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating || !email || !roleId}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Criar Convite"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SimpleCreateInviteDialog;
