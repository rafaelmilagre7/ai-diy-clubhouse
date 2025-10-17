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

interface CreateInviteDialogProps {
  roles: any[];
  onInviteCreated: () => void;
}

const CreateInviteDialog = ({ roles, onInviteCreated }: CreateInviteDialogProps) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState("");
  const [notes, setNotes] = useState("");
  const [expiration, setExpiration] = useState("7 days");
  const [channelPreference, setChannelPreference] = useState<'email' | 'whatsapp' | 'both'>('email');
  const [open, setOpen] = useState(false);
  const { createInvite, isCreating } = useInviteCreate();

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
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
        toast.error("Formato de telefone inválido");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const result = await createInvite(email, roleId, notes, expiration, phone, channelPreference);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Convite
        </Button>
      </DialogTrigger>
      <DialogContent className="dark sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-surface-elevated text-foreground border border-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-foreground">Criar Novo Convite</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Envie um convite para novos membros acessarem a plataforma. Um perfil será criado automaticamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Formulário */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 bg-surface-elevated border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-operational focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="channel" className="text-sm font-medium text-foreground">
                  Canal de Envio *
                </Label>
                <Select value={channelPreference} onValueChange={(value: 'email' | 'whatsapp' | 'both') => setChannelPreference(value)}>
                  <SelectTrigger id="channel" className="h-10 bg-surface-elevated border-border text-foreground">
                    <SelectValue placeholder="Como enviar o convite?" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-elevated border-border">
                    <SelectItem value="email" className="text-foreground hover:bg-muted">📧 Apenas Email</SelectItem>
                    <SelectItem value="whatsapp" className="text-foreground hover:bg-muted">📱 Apenas WhatsApp</SelectItem>
                    <SelectItem value="both" className="text-foreground hover:bg-muted">📧📱 Email + WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(channelPreference === 'whatsapp' || channelPreference === 'both') && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Telefone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={handlePhoneChange}
                    required
                    className="h-10 bg-surface-elevated border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-operational focus:border-transparent"
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: (11) 99999-9999
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-foreground">
                  Papel *
                </Label>
                <Select value={roleId} onValueChange={setRoleId} required>
                  <SelectTrigger id="role" className="h-10 bg-surface-elevated border-border text-foreground">
                    <SelectValue placeholder="Selecione um papel" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-elevated border-border">
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id} className="text-foreground hover:bg-muted">
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiration" className="text-sm font-medium text-foreground">
                  Expira em
                </Label>
                <Select value={expiration} onValueChange={setExpiration}>
                  <SelectTrigger id="expiration" className="h-10 bg-surface-elevated border-border text-foreground">
                    <SelectValue placeholder="Período de expiração" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-elevated border-border">
                    <SelectItem value="1 day" className="text-foreground hover:bg-muted">1 dia</SelectItem>
                    <SelectItem value="3 days" className="text-foreground hover:bg-muted">3 dias</SelectItem>
                    <SelectItem value="7 days" className="text-foreground hover:bg-muted">7 dias</SelectItem>
                    <SelectItem value="14 days" className="text-foreground hover:bg-muted">14 dias</SelectItem>
                    <SelectItem value="30 days" className="text-foreground hover:bg-muted">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                  Nome/Observações (opcional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Nome da pessoa ou informações adicionais"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px] resize-none bg-surface-elevated border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-operational focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Se informar apenas um nome, ele será automaticamente preenchido no registro
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setOpen(false)}
              className="h-10"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating}
              className="h-10"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando Perfil...
                </>
              ) : (
                "Criar Convite + Perfil"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInviteDialog;