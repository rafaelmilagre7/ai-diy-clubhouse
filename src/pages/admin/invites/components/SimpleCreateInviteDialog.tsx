
import { useState } from "react";
import { Loader2, Plus, AlertCircle, CheckCircle } from "lucide-react";
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
  const [lastResult, setLastResult] = useState<any>(null);
  
  const { createInvite, loading } = useInviteCreate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!email.trim()) {
      toast.error("Email é obrigatório");
      return;
    }
    
    if (!roleId) {
      toast.error("Papel é obrigatório");
      return;
    }

    if (!email.includes('@')) {
      toast.error("Email inválido");
      return;
    }
    
    try {
      console.log("🎯 Criando convite:", { email, roleId, expiration, notes });
      
      const result = await createInvite({ 
        email: email.trim(), 
        roleId, 
        notes: notes.trim() || undefined, 
        expiresIn: expiration 
      });
      
      setLastResult(result);
      
      if (result && result.status === 'success') {
        // Sucesso completo
        setEmail("");
        setRoleId("");
        setNotes("");
        setExpiration("7 days");
        setOpen(false);
        onInviteCreated();
      } else if (result && result.status === 'partial_success') {
        // Convite criado mas email falhou - manter dialog aberto para mostrar status
        onInviteCreated(); // Atualizar lista mesmo assim
      }
      // Se result for null, o erro já foi mostrado no hook
      
    } catch (error: any) {
      console.error("Erro no formulário:", error);
      toast.error("Erro inesperado", {
        description: error.message
      });
    }
  };

  const getResultIcon = () => {
    if (!lastResult) return null;
    
    if (lastResult.status === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getResultMessage = () => {
    if (!lastResult) return null;
    
    if (lastResult.status === 'success') {
      return {
        title: "Convite enviado com sucesso!",
        description: `Email enviado para ${lastResult.invite?.email}`
      };
    } else if (lastResult.status === 'partial_success') {
      return {
        title: "Convite criado, mas email falhou",
        description: "O convite foi salvo e pode ser reenviado manualmente"
      };
    }
    
    return null;
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
            {/* Mostrar resultado do último envio */}
            {lastResult && (
              <Alert variant={lastResult.status === 'success' ? 'default' : 'destructive'}>
                {getResultIcon()}
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">{getResultMessage()?.title}</p>
                    <p className="text-sm">{getResultMessage()?.description}</p>
                  </div>
                </AlertDescription>
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
                required
                disabled={loading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Papel *</Label>
              <Select value={roleId} onValueChange={setRoleId} required disabled={loading}>
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
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                setOpen(false);
                setLastResult(null);
              }}
              disabled={loading}
            >
              {lastResult ? 'Fechar' : 'Cancelar'}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
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
