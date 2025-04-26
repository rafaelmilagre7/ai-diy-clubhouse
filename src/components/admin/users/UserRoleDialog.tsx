
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
import { useEffect, useCallback } from "react";

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
  // Função para limpar backdrops e portais
  const cleanupOverlays = useCallback(() => {
    // Remove todos os backdrops do Radix UI
    const radixBackdrops = document.querySelectorAll("[data-state='open'].bg-black");
    radixBackdrops.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    
    // Remove quaisquer portais Radix pendentes
    const radixPortals = document.querySelectorAll('[data-radix-portal]');
    radixPortals.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    
    // Remove backdrops do MUI (se existirem)
    const muiBackdrops = document.querySelectorAll('.MuiBackdrop-root');
    muiBackdrops.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    
    // Logs temporários para confirmar remoção (podem ser removidos após os testes)
    console.log('Limpeza de overlays executada');
  }, []);

  // Garantir que o modal seja completamente fechado quando a prop open mudar para false
  useEffect(() => {
    if (!open) {
      console.log('Modal fechado, executando limpeza de overlays');
      cleanupOverlays();
    }
    
    // Cleanup na desmontagem do componente
    return () => {
      console.log('Componente desmontado, executando limpeza final');
      cleanupOverlays();
    };
  }, [open, cleanupOverlays]);

  // Função segura para fechar o modal
  const handleCloseModal = () => {
    console.log('Fechamento de modal solicitado');
    onOpenChange(false);
    setTimeout(cleanupOverlays, 50);
  };

  // Função para lidar com salvamento e fechamento
  const handleUpdateAndClose = () => {
    console.log('Salvamento solicitado');
    onUpdateRole();
    // Apenas fechar se não estiver salvando
    if (!saving) {
      setTimeout(() => {
        onOpenChange(false);
        setTimeout(cleanupOverlays, 100);
      }, 50);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent 
        onEscapeKeyDown={handleCloseModal} 
        onInteractOutside={handleCloseModal}
        onPointerDownOutside={handleCloseModal}
        className="z-50"
      >
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
            onClick={handleCloseModal} 
            disabled={saving}
            type="button"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateAndClose} 
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
