
import { useState } from "react";
import { Loader2, Plus, Mail, MessageCircle } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  const [expiration, setExpiration] = useState("7 days");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  
  const { createInvite, loading } = useInviteCreate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!email?.includes('@')) {
      toast.error("Email inválido");
      return;
    }

    if (!roleId) {
      toast.error("Selecione um papel");
      return;
    }

    // Validar canais selecionados
    const channels: ('email' | 'whatsapp')[] = [];
    if (emailEnabled) channels.push('email');
    if (whatsappEnabled) {
      if (!whatsappNumber.trim()) {
        toast.error("Número do WhatsApp é obrigatório quando WhatsApp estiver habilitado");
        return;
      }
      channels.push('whatsapp');
    }

    if (channels.length === 0) {
      toast.error("Selecione pelo menos um canal de comunicação");
      return;
    }

    const result = await createInvite({ 
      email, 
      roleId, 
      notes, 
      expiresIn: expiration,
      whatsappNumber: whatsappEnabled ? whatsappNumber : undefined,
      channels
    });

    if (result) {
      if (result.status === 'success') {
        setEmail("");
        setRoleId("");
        setNotes("");
        setWhatsappNumber("");
        setExpiration("7 days");
        setEmailEnabled(true);
        setWhatsappEnabled(false);
        setOpen(false);
      }
      onInviteCreated();
    }
  };

  const formatWhatsAppNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
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
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Novo Convite</DialogTitle>
            <DialogDescription>
              Sistema multicanal - Envie convites por e-mail e/ou WhatsApp
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
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

            <div className="grid gap-3">
              <Label>Canais de Comunicação *</Label>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-channel"
                    checked={emailEnabled}
                    onCheckedChange={setEmailEnabled}
                  />
                  <Label htmlFor="email-channel" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    E-mail
                  </Label>
                  <Badge variant="secondary">Recomendado</Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="whatsapp-channel"
                    checked={whatsappEnabled}
                    onCheckedChange={setWhatsappEnabled}
                  />
                  <Label htmlFor="whatsapp-channel" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Label>
                  <Badge variant="outline">Opcional</Badge>
                </div>
              </div>

              {whatsappEnabled && (
                <div className="grid gap-2 ml-6">
                  <Label htmlFor="whatsapp">Número do WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(formatWhatsAppNumber(e.target.value))}
                    maxLength={15}
                  />
                  <p className="text-sm text-muted-foreground">
                    Digite apenas números. Formato: (XX) XXXXX-XXXX
                  </p>
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="expiration">Expira em</Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger id="expiration">
                  <SelectValue />
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
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Informações adicionais que serão incluídas no convite (opcional)"
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
            <Button type="submit" disabled={loading || !email || !roleId || (!emailEnabled && !whatsappEnabled)}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando e Enviando...
                </>
              ) : (
                "Criar e Enviar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleCreateInviteDialog;
