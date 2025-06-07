
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

  const getChannelDescription = (channel: string) => {
    switch (channel) {
      case 'email': return 'Enviar convite apenas por email';
      case 'whatsapp': return 'Enviar convite apenas via WhatsApp';
      case 'both': return 'Enviar convite por email E WhatsApp';
      default: return '';
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
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Convite</DialogTitle>
            <DialogDescription>
              Convide um novo usuário via email e/ou WhatsApp.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="phone">
                Telefone {(channelPreference === 'whatsapp' || channelPreference === 'both') && '*'}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={15}
              />
              <p className="text-xs text-muted-foreground">
                Formato: (XX) XXXXX-XXXX - Necessário para WhatsApp
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Papel *</Label>
              <Select value={roleId} onValueChange={setRoleId} required>
                <SelectTrigger>
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

            <div className="space-y-3">
              <Label>Canal de Envio *</Label>
              <RadioGroup 
                value={channelPreference} 
                onValueChange={(value: 'email' | 'whatsapp' | 'both') => setChannelPreference(value)}
                className="grid grid-cols-1 gap-2"
              >
                {(['email', 'whatsapp', 'both'] as const).map((channel) => (
                  <div key={channel} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
                    <RadioGroupItem value={channel} id={channel} />
                    <Label htmlFor={channel} className="flex items-center gap-2 cursor-pointer flex-1">
                      {getChannelIcon(channel)}
                      <div>
                        <div className="font-medium capitalize">
                          {channel === 'both' ? 'Email + WhatsApp' : channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getChannelDescription(channel)}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiration">Válido por</Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger>
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
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Informações extras sobre o convite"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Criando..." : "Criar Convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleCreateInviteDialog;
