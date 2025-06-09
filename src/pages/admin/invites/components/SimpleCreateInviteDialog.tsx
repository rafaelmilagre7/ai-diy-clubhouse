
import { useState } from "react";
import { Plus, Mail, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useInviteCreate } from "@/hooks/admin/invites/useInviteCreate";
import { toast } from "sonner";

interface SimpleCreateInviteDialogProps {
  roles: any[];
  onInviteCreated: () => void;
}

const SimpleCreateInviteDialog = ({ roles, onInviteCreated }: SimpleCreateInviteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState("");
  const [notes, setNotes] = useState("");
  const [expiration, setExpiration] = useState("7 days");
  const [channelPreference, setChannelPreference] = useState<'email' | 'whatsapp' | 'both'>('email');
  
  const { createInvite, isCreating } = useInviteCreate();

  const formatPhone = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara: (XX) XXXXX-XXXX
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const validateForm = () => {
    if (!email || !roleId) {
      toast.error("Email e papel são obrigatórios");
      return false;
    }

    if ((channelPreference === 'whatsapp' || channelPreference === 'both') && !phone) {
      toast.error("Telefone é obrigatório para envio via WhatsApp");
      return false;
    }

    // Validar formato do telefone se fornecido
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        toast.error("Formato de telefone inválido. Use: (XX) XXXXX-XXXX");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const cleanPhone = phone ? phone.replace(/\D/g, '') : undefined;
    
    const result = await createInvite(email, roleId, notes, expiration, cleanPhone, channelPreference);
    if (result) {
      setEmail("");
      setPhone("");
      setRoleId("");
      setNotes("");
      setExpiration("7 days");
      setChannelPreference('email');
      setOpen(false);
      onInviteCreated();
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />;
      case 'both': return <Send className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Convite
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3">
            <DialogTitle>Criar Convite</DialogTitle>
            <DialogDescription className="text-sm">
              Convide um novo usuário via email e/ou WhatsApp.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">
                Telefone {(channelPreference === 'whatsapp' || channelPreference === 'both') && '*'}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={15}
                className="h-9"
              />
              <p className="text-xs text-muted-foreground">
                Necessário para WhatsApp
              </p>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-sm">Papel *</Label>
              <Select value={roleId} onValueChange={setRoleId} required>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione o papel" />
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

            <div className="space-y-2">
              <Label className="text-sm">Canal de Envio *</Label>
              <RadioGroup 
                value={channelPreference} 
                onValueChange={(value: 'email' | 'whatsapp' | 'both') => setChannelPreference(value)}
                className="grid grid-cols-1 gap-1.5"
              >
                {(['email', 'whatsapp', 'both'] as const).map((channel) => (
                  <div key={channel} className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50">
                    <RadioGroupItem value={channel} id={channel} />
                    <Label htmlFor={channel} className="flex items-center gap-2 cursor-pointer flex-1 text-sm">
                      {getChannelIcon(channel)}
                      <div>
                        <div className="font-medium">
                          {channel === 'both' ? 'Email + WhatsApp' : channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="expiration" className="text-sm">Válido por</Label>
                <Select value={expiration} onValueChange={setExpiration}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
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
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-sm">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Informações extras..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="resize-none text-sm"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-9">
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating} className="h-9">
              {isCreating ? "Criando..." : "Criar Convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleCreateInviteDialog;
