
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
import { useEffect, useCallback, useRef } from "react";

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
  // Ref para rastrear se o componente está montado
  const isMounted = useRef(true);
  
  // Função robusta para limpar backdrops e portais
  const cleanupOverlays = useCallback(() => {
    console.log('Executando limpeza de overlays no UserRoleDialog');
    
    // Remove todos os backdrops do Radix UI
    const radixBackdrops = document.querySelectorAll("[data-state='open'].bg-black");
    console.log('Radix backdrops encontrados:', radixBackdrops.length);
    radixBackdrops.forEach(el => {
      if (el.parentNode) {
        console.log('Removendo backdrop Radix');
        el.parentNode.removeChild(el);
      }
    });
    
    // Remove quaisquer portais Radix pendentes
    const radixPortals = document.querySelectorAll('[data-radix-portal]');
    console.log('Radix portals encontrados:', radixPortals.length);
    radixPortals.forEach(el => {
      if (el.parentNode) {
        console.log('Removendo portal Radix');
        el.parentNode.removeChild(el);
      }
    });
    
    // Remove backdrops do MUI (direto)
    const muiBackdrops = document.querySelectorAll('.MuiBackdrop-root');
    console.log('MUI backdrops encontrados:', muiBackdrops.length);
    muiBackdrops.forEach(el => {
      console.log('Removendo backdrop MUI');
      el.remove();
    });
    
    // Limpa qualquer portal MUI
    const muiPortals = document.querySelectorAll('#mui-modal-root > div');
    console.log('MUI portals encontrados:', muiPortals.length);
    muiPortals.forEach(el => {
      console.log('Removendo portal MUI');
      el.remove();
    });
    
    // Restaura overflow do body se necessário
    if (document.body.style.overflow === 'hidden') {
      console.log('Restaurando overflow do body');
      document.body.style.overflow = '';
    }
    
    console.log('Backdrop removido:', document.querySelectorAll('.MuiBackdrop-root').length);
    console.log('Portals Radix restantes:', document.querySelectorAll('[data-radix-portal]').length);
  }, []);

  // Garantir limpeza ao desmontar o componente
  useEffect(() => {
    return () => {
      isMounted.current = false;
      console.log('UserRoleDialog desmontado, executando limpeza final');
      // Pequeno delay para garantir que desmontagem termine primeiro
      setTimeout(cleanupOverlays, 10);
    };
  }, [cleanupOverlays]);

  // Garantir limpeza quando o modal é fechado
  useEffect(() => {
    if (!open && isMounted.current) {
      console.log('Modal fechado no efeito, executando limpeza');
      // Pequeno delay para permitir animação de fechamento
      setTimeout(cleanupOverlays, 100);
    }
  }, [open, cleanupOverlays]);

  // Função para fechar o modal com segurança
  const handleCloseModal = useCallback(() => {
    console.log('Fechamento de modal solicitado');
    onOpenChange(false);
    // Executar limpeza após transição do modal
    setTimeout(cleanupOverlays, 200);
  }, [onOpenChange, cleanupOverlays]);

  // Função para lidar com salvamento e fechamento
  const handleUpdateAndClose = useCallback(() => {
    console.log('Salvamento solicitado');
    onUpdateRole();
    // Apenas executar se não estiver salvando
    if (!saving) {
      // Fechar modal
      onOpenChange(false);
      // Agendar limpeza para após animação fechar
      setTimeout(cleanupOverlays, 300);
    }
  }, [onUpdateRole, saving, onOpenChange, cleanupOverlays]);

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
