
import { useState } from "react";
import { Loader2, Plus, Clock, Mail, CheckCircle } from "lucide-react";
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
  const { createInvite, loading, currentStep, isCreating, isSending } = useInviteCreate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !roleId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    try {
      const result = await createInvite({
        email,
        roleId,
        notes
      });
      
      if (result) {
        setEmail("");
        setRoleId("");
        setNotes("");
        setOpen(false);
        onInviteCreated();
        
        if (result.status === 'success') {
          toast.success(`Convite enviado para ${email} com sucesso!`);
        } else if (result.status === 'partial_success') {
          toast.warning(`Convite criado para ${email}, mas email não foi enviado. Tente reenviar manualmente.`);
        }
      }
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      // O toast de erro já é mostrado pelo hook
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 'creating':
        return <Clock className="mr-2 h-4 w-4 animate-pulse text-blue-500" />;
      case 'sending':
        return <Mail className="mr-2 h-4 w-4 animate-pulse text-orange-500" />;
      case 'complete':
        return <CheckCircle className="mr-2 h-4 w-4 text-green-500" />;
      default:
        return <Plus className="mr-2 h-4 w-4" />;
    }
  };

  const getButtonText = () => {
    if (isCreating) return "Criando convite...";
    if (isSending) return "Enviando email...";
    if (loading) return "Processando...";
    return "Criar Convite";
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
          
          {/* Status do processo */}
          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center text-sm text-blue-800">
                {getStepIcon()}
                <span>
                  {isCreating && "Criando convite no sistema..."}
                  {isSending && "Enviando email de convite..."}
                </span>
              </div>
            </div>
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
