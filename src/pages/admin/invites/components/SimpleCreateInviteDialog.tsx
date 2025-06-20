
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { UserPlus, Mail, MessageCircle } from "lucide-react";
import { useInviteCreate } from "@/hooks/admin/invites/useInviteCreate";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface SimpleCreateInviteDialogProps {
  roles: Role[];
  onInviteCreated: () => void;
}

const SimpleCreateInviteDialog = ({ roles, onInviteCreated }: SimpleCreateInviteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [notes, setNotes] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  
  const { createInvite, loading } = useInviteCreate();

  const resetForm = () => {
    setEmail("");
    setRoleId("");
    setNotes("");
    setWhatsappNumber("");
    setEmailEnabled(true);
    setWhatsappEnabled(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !roleId) {
      toast.error("Email e papel são obrigatórios");
      return;
    }

    // Verificar se pelo menos um canal está habilitado
    if (!emailEnabled && !whatsappEnabled) {
      toast.error("Selecione pelo menos um canal de comunicação");
      return;
    }

    // Se WhatsApp está habilitado, verificar se o número foi fornecido
    if (whatsappEnabled && !whatsappNumber.trim()) {
      toast.error("Número do WhatsApp é obrigatório quando WhatsApp está habilitado");
      return;
    }

    try {
      // Determinar quais canais usar
      const channels: ('email' | 'whatsapp')[] = [];
      if (emailEnabled) channels.push('email');
      if (whatsappEnabled) channels.push('whatsapp');

      const result = await createInvite({
        email,
        roleId,
        notes: notes.trim() || undefined,
        expiresIn: '7 days',
        whatsappNumber: whatsappEnabled ? whatsappNumber.trim() : undefined,
        channels
      });

      if (result?.status === 'success') {
        resetForm();
        setOpen(false);
        onInviteCreated();
      }
    } catch (error) {
      console.error("Erro ao criar convite:", error);
    }
  };

  const handleEmailCheckboxChange = (checked: boolean | "indeterminate") => {
    setEmailEnabled(checked === true);
  };

  const handleWhatsappCheckboxChange = (checked: boolean | "indeterminate") => {
    setWhatsappEnabled(checked === true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Criar Convite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Convite</DialogTitle>
          <DialogDescription>
            Convide um novo usuário para a plataforma via email e/ou WhatsApp
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Papel *</Label>
            <Select value={roleId} onValueChange={setRoleId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um papel" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div>
                      <div className="font-medium">{role.name}</div>
                      {role.description && (
                        <div className="text-sm text-muted-foreground">
                          {role.description}
                        </div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Canais de Comunicação *</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-channel"
                  checked={emailEnabled}
                  onCheckedChange={handleEmailCheckboxChange}
                />
                <Label htmlFor="email-channel" className="flex items-center cursor-pointer">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp-channel"
                  checked={whatsappEnabled}
                  onCheckedChange={handleWhatsappCheckboxChange}
                />
                <Label htmlFor="whatsapp-channel" className="flex items-center cursor-pointer">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  WhatsApp
                </Label>
              </div>
            </div>

            {whatsappEnabled && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="whatsapp">Número do WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+55 11 99999-9999"
                  required={whatsappEnabled}
                />
                <p className="text-xs text-muted-foreground">
                  Inclua código do país (ex: +55 para Brasil)
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o convite (opcional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Convite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleCreateInviteDialog;
