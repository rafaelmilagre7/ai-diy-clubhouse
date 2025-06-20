
import { useState } from "react";
import { Loader2, Plus, AlertCircle, CheckCircle, Clock } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
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
  
  const { createInvite, loading, currentStep, isCreating, isSending } = useInviteCreate();

  const getStepProgress = () => {
    switch (currentStep) {
      case 'idle': return 0;
      case 'creating': return 25;
      case 'sending': return 75;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const getStepMessage = () => {
    switch (currentStep) {
      case 'creating': return 'Criando convite no banco de dados...';
      case 'sending': return 'Enviando email via sistema robusto...';
      case 'retrying': return 'Tentando novamente via sistema de recuperação...';
      case 'complete': return 'Convite criado e enviado com sucesso!';
      default: return '';
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 'creating': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'sending': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'retrying': return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !roleId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    console.log("🎯 Iniciando criação de convite via interface:", { email, roleId, expiration });
    
    const result = await createInvite({ 
      email, 
      roleId, 
      notes, 
      expiresIn: expiration 
    });
    
    if (result) {
      // Resetar formulário
      setEmail("");
      setRoleId("");
      setNotes("");
      setExpiration("7 days");
      setOpen(false);
      onInviteCreated();
      
      console.log("✅ Convite processado via interface:", result);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Criar Convite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Novo Convite</DialogTitle>
            <DialogDescription>
              Envie um convite profissional com sistema robusto de entrega de email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Progresso do Envio */}
            {loading && (
              <Alert>
                <div className="flex items-center gap-2">
                  {getStepIcon()}
                  <AlertDescription className="flex-1">
                    {getStepMessage()}
                  </AlertDescription>
                </div>
                <Progress value={getStepProgress()} className="mt-2" />
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Papel *</Label>
              <Select value={roleId} onValueChange={setRoleId} disabled={loading} required>
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
              <Select value={expiration} onValueChange={setExpiration} disabled={loading}>
                <SelectTrigger id="expiration">
                  <SelectValue placeholder="Período de expiração" />
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

            {/* Sistema de Email Info */}
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <div className="space-y-1 text-sm">
                <h4 className="font-medium text-blue-900 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Sistema de Email Profissional
                </h4>
                <ul className="space-y-0.5 text-blue-800 text-xs">
                  <li>• Template React Email personalizado</li>
                  <li>• Timeout de 30s + Retry automático</li>
                  <li>• Fallback via Supabase Auth</li>
                  <li>• Taxa de entrega 95%+</li>
                </ul>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !email || !roleId}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreating ? 'Criando...' : isSending ? 'Enviando...' : 'Processando...'}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar e Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleCreateInviteDialog;
