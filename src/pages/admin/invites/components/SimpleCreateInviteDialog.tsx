
import { useState } from "react";
import { Loader2, Plus, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInviteCreate } from "@/hooks/admin/invites/useInviteCreate";

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
  const { createInvite, loading } = useInviteCreate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!email || !email.includes('@')) {
      toast.error("Email inválido", {
        description: "Por favor, insira um email válido"
      });
      return;
    }

    if (!roleId) {
      toast.error("Papel obrigatório", {
        description: "Por favor, selecione um papel para o convite"
      });
      return;
    }

    console.log('🎯 Criando convite com dados:', { email, roleId, notes, expiration });
    
    const result = await createInvite({ 
      email, 
      roleId, 
      notes, 
      expiresIn: expiration 
    });

    if (result) {
      console.log('✅ Convite criado com sucesso:', result);
      
      // Resetar formulário
      setEmail("");
      setRoleId("");
      setNotes("");
      setExpiration("7 days");
      setOpen(false);
      
      // Atualizar lista
      onInviteCreated();
      
      // Feedback adicional baseado no status
      if (result.status === 'partial_success') {
        toast.warning("Atenção", {
          description: "Convite criado mas verifique se o email foi enviado corretamente."
        });
      }
    } else {
      console.error('❌ Falha ao criar convite');
    }
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
          
          <div className="grid gap-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                O sistema foi refatorado. Agora usa a função create_invite do banco e envia emails automaticamente.
              </AlertDescription>
            </Alert>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Aceita formatos como: user+alias@domain.com
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Papel *</Label>
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
                  <SelectItem value="7 days">7 dias (padrão)</SelectItem>
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
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !email || !roleId}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando e Enviando...
                </>
              ) : (
                "Criar e Enviar Convite"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleCreateInviteDialog;
