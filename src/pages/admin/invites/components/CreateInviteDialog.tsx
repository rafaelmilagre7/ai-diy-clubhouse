
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
  const [roleId, setRoleId] = useState("");
  const [notes, setNotes] = useState("");
  const [expiration, setExpiration] = useState("7 days");
  const [open, setOpen] = useState(false);
  const { createInvite, isCreating } = useInviteCreate();
  const { validationState, validateInviteData } = useInviteValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    const result = await createInvite(email, roleId, notes, expiration);
    if (result) {
      setEmail("");
      setRoleId("");
      setNotes("");
      setExpiration("7 days");
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border border-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-foreground">Criar Novo Convite</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Envie um convite para novos membros acessarem a plataforma.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Alertas de validação */}
            {validationState.errors.length > 0 && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm text-destructive-foreground">
                  {validationState.errors.join(', ')}
                </AlertDescription>
              </Alert>
            )}

            {validationState.warnings.length > 0 && (
              <Alert className="border-orange-500/50 bg-orange-500/5">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-sm text-orange-500">
                  {validationState.warnings.join(', ')}
                </AlertDescription>
              </Alert>
            )}

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
                  className="h-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-foreground">
                  Papel *
                </Label>
                <Select value={roleId} onValueChange={setRoleId} required>
                  <SelectTrigger id="role" className="h-10 bg-input border-border text-foreground">
                    <SelectValue placeholder="Selecione um papel" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id} className="text-foreground hover:bg-accent">
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
                  <SelectTrigger id="expiration" className="h-10 bg-input border-border text-foreground">
                    <SelectValue placeholder="Período de expiração" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="1 day" className="text-foreground hover:bg-accent">1 dia</SelectItem>
                    <SelectItem value="3 days" className="text-foreground hover:bg-accent">3 dias</SelectItem>
                    <SelectItem value="7 days" className="text-foreground hover:bg-accent">7 dias</SelectItem>
                    <SelectItem value="14 days" className="text-foreground hover:bg-accent">14 dias</SelectItem>
                    <SelectItem value="30 days" className="text-foreground hover:bg-accent">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                  Observações (opcional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre o convite"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px] resize-none bg-input border-border text-foreground placeholder:text-muted-foreground"
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
