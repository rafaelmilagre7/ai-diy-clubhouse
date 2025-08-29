
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
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import '@/styles/phone-input.css';
import { validateInternationalPhone } from "@/utils/validationUtils";

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

  const handlePhoneChange = (phoneValue: string) => {
    setPhone(phoneValue);
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
      if (!validateInternationalPhone(phone)) {
        toast.error("Formato de telefone internacional inválido");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const internationalPhone = phone || undefined;
    
    // 🚀 NOVA UX: Fechar modal imediatamente sem toast de processamento
    
    // Resetar formulário e fechar modal IMEDIATAMENTE
    const formData = { email, roleId, notes, expiration, phone: internationalPhone, channelPreference };
    setEmail("");
    setPhone("");
    setRoleId("");
    setNotes("");
    setExpiration("7 days");
    setChannelPreference('email');
    setOpen(false);
    
    // Processar convite em background (não bloquear UI) - SEM TOAST INTERMEDIÁRIO
    setTimeout(async () => {
      try {
        const result = await createInvite(
          formData.email, 
          formData.roleId, 
          formData.notes, 
          formData.expiration, 
          formData.phone, 
          formData.channelPreference
        );
        
        if (result) {
          // Atualizar lista após sucesso
          onInviteCreated();
        }
      } catch (error: any) {
        // Erro já tratado no hook, apenas garantir atualização da lista
        onInviteCreated();
      }
    }, 50); // 50ms para permitir que modal feche primeiro
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
      <DialogContent className="dark max-w-md max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3">
            <DialogTitle className="text-white">Criar Convite</DialogTitle>
            <DialogDescription className="text-sm text-gray-300">
              Convide um novo usuário via email e/ou WhatsApp.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-white">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm text-white">
                Telefone {(channelPreference === 'whatsapp' || channelPreference === 'both') && '*'}
              </Label>
              <PhoneInput
                defaultCountry="br"
                value={phone}
                onChange={handlePhoneChange}
                inputClassName="h-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 flex-1"
                countrySelectorStyleProps={{
                  className: "h-9 bg-gray-800 border-gray-700"
                }}
                className="phone-input-container"
                preferredCountries={['br', 'us', 'ar', 'cl', 'co', 'mx']}
              />
              <p className="text-xs text-gray-400">
                Selecione o país e digite o número (necessário para WhatsApp)
              </p>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-sm text-white">Papel *</Label>
              <Select value={roleId} onValueChange={setRoleId} required>
                <SelectTrigger className="h-9 bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Selecione o papel" className="text-gray-400" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id} className="text-white hover:bg-gray-700">
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-white">Canal de Envio *</Label>
              <RadioGroup 
                value={channelPreference} 
                onValueChange={(value: 'email' | 'whatsapp' | 'both') => setChannelPreference(value)}
                className="grid grid-cols-1 gap-1.5"
              >
                {(['email', 'whatsapp', 'both'] as const).map((channel) => (
                  <div key={channel} className="flex items-center space-x-2 border border-gray-700 rounded-md p-2 hover:bg-gray-800/50">
                    <RadioGroupItem value={channel} id={channel} className="border-gray-700 text-white" />
                    <Label htmlFor={channel} className="flex items-center gap-2 cursor-pointer flex-1 text-sm text-white">
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
                <Label htmlFor="expiration" className="text-sm text-white">Válido por</Label>
                <Select value={expiration} onValueChange={setExpiration}>
                  <SelectTrigger className="h-9 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="1 day" className="text-white hover:bg-gray-700">1 dia</SelectItem>
                    <SelectItem value="3 days" className="text-white hover:bg-gray-700">3 dias</SelectItem>
                    <SelectItem value="7 days" className="text-white hover:bg-gray-700">7 dias</SelectItem>
                    <SelectItem value="14 days" className="text-white hover:bg-gray-700">14 dias</SelectItem>
                    <SelectItem value="30 days" className="text-white hover:bg-gray-700">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-sm text-white">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Informações extras..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="resize-none text-sm bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-9 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating} className="h-9 bg-blue-600 hover:bg-blue-700 text-white">
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Criando...
                </div>
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
