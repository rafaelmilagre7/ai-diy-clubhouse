
import { useState } from "react";
import { Plus } from "lucide-react";
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
import { useTrustedDomainCreate } from "@/hooks/admin/domains/useTrustedDomainCreate";

interface CreateDomainDialogProps {
  roles: any[];
  onDomainCreated: () => void;
}

const CreateDomainDialog = ({ roles, onDomainCreated }: CreateDomainDialogProps) => {
  const [domain, setDomain] = useState("");
  const [roleId, setRoleId] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const { createDomain, isCreating } = useTrustedDomainCreate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!domain || !roleId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    // Validação simples de domínio
    if (!domain.includes('.')) {
      toast.error("Formato de domínio inválido");
      return;
    }
    
    const result = await createDomain(domain, roleId, description);
    if (result) {
      setDomain("");
      setRoleId("");
      setDescription("");
      setOpen(false);
      onDomainCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Domínio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-dialog-form">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Domínio Confiável</DialogTitle>
            <DialogDescription>
              Adicione um domínio de email que terá acesso automático com um papel específico.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="domain">Domínio</Label>
              <Input
                id="domain"
                type="text"
                placeholder="exemplo.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain-role">Papel</Label>
              <Select value={roleId} onValueChange={setRoleId} required>
                <SelectTrigger id="domain-role">
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
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descrição sobre este domínio confiável"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Criando..." : "Adicionar Domínio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDomainDialog;
