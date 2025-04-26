
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, User } from "lucide-react";
import { UserProfile } from "@/lib/supabase";
import { useEffect } from "react";

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: UserProfile | null;
  newRole: string;
  onRoleChange: (value: string) => void;
  onUpdateRole: () => void;
  saving: boolean;
}

export const UserRoleDialog = ({
  open,
  onOpenChange,
  selectedUser,
  newRole,
  onRoleChange,
  onUpdateRole,
  saving,
}: UserRoleDialogProps) => {
  // Garantir que o modal seja completamente fechado quando a prop open mudar para false
  useEffect(() => {
    if (!open) {
      // Forçar limpeza de qualquer backdrop ou overlay persistente
      const backdrops = document.querySelectorAll("[data-state='open'].bg-black");
      backdrops.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onEscapeKeyDown={() => onOpenChange(false)} onInteractOutside={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Alterar Função do Usuário</DialogTitle>
          <DialogDescription>
            Altere a função do usuário {selectedUser?.name || selectedUser?.email}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Select value={newRole} onValueChange={onRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-600" />
                  Administrador
                </div>
              </SelectItem>
              <SelectItem value="member">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-green-600" />
                  Membro
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={saving}
            type="button"
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              onUpdateRole();
              // Garantir que o modal feche após salvar
              if (!saving) {
                onOpenChange(false);
              }
            }} 
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
