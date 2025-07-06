
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
import { useInviteValidation } from "@/hooks/admin/invites/useInviteValidation";

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
  const { validationState, validateInviteData } = useInviteValidation();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações adicionais
    if (!email || !roleId) {
      toast.error("Email e papel são obrigatórios");
      return;
    }

    if ((channelPreference === 'whatsapp' || channelPreference === 'both') && !phone) {
      toast.error("Telefone é obrigatório para envio via WhatsApp");
      return;
    }

    // Validar formato do telefone se fornecido
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        toast.error("Formato de telefone inválido");
        return;
      }
    }

    // Validar dados antes de enviar
    const validation = validateInviteData(email, roleId);
    if (!validation.isValid) {
      toast.error("Dados inválidos", {
        description: validation.errors.join(', ')
      });
      return;
    }

    // Mostrar avisos se houver
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => {
        toast.warning("Atenção", { description: warning });
      });
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
      <DialogContent className="dark sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-white">Criar Novo Convite</DialogTitle>
            <DialogDescription className="text-gray-300">
              Envie um convite para novos membros acessarem a plataforma.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Alertas de validação */}
            {validationState.errors.length > 0 && (
              <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-sm text-red-300">
                  {validationState.errors.join(', ')}
                </AlertDescription>
              </Alert>
            )}

            {validationState.warnings.length > 0 && (
              <Alert className="border-orange-500/50 bg-orange-500/10">
                <AlertCircle className="h-4 w-4 text-orange-400" />
                <AlertDescription className="text-sm text-orange-300">
                  {validationState.warnings.join(', ')}
                </AlertDescription>
              </Alert>
            )}

            {/* Formulário */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="channel" className="text-sm font-medium text-white">
                  Canal de Envio *
                </Label>
                <Select value={channelPreference} onValueChange={(value: 'email' | 'whatsapp' | 'both') => setChannelPreference(value)}>
                  <SelectTrigger id="channel" className="h-10 bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Como enviar o convite?" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="email" className="text-white hover:bg-gray-700">📧 Apenas Email</SelectItem>
                    <SelectItem value="whatsapp" className="text-white hover:bg-gray-700">📱 Apenas WhatsApp</SelectItem>
                    <SelectItem value="both" className="text-white hover:bg-gray-700">📧📱 Email + WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(channelPreference === 'whatsapp' || channelPreference === 'both') && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-white">
                    Telefone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={handlePhoneChange}
                    required
                    className="h-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400">
                    Formato: (11) 99999-9999
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-white">
                  Papel *
                </Label>
                <Select value={roleId} onValueChange={setRoleId} required>
                  <SelectTrigger id="role" className="h-10 bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Selecione um papel" />
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
                <Label htmlFor="expiration" className="text-sm font-medium text-white">
                  Expira em
                </Label>
                <Select value={expiration} onValueChange={setExpiration}>
                  <SelectTrigger id="expiration" className="h-10 bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Período de expiração" />
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
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-white">
                  Observações (opcional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre o convite"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px] resize-none bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
              disabled={isCreating || !validationState.isValid}
              className="h-10"
            >
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
  );
};

export default CreateInviteDialog;
