
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
  // Ref para controlar se o componente está montado
  const isMounted = useRef(true);
  
  // Função otimizada para limpar elementos que podem bloquear a interface
  const cleanupOverlays = useCallback(() => {
    console.log('Limpando overlays no UserRoleDialog');
    
    // Restaurar estilos do body
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
    document.body.removeAttribute('aria-hidden');
    document.body.style.paddingRight = '';
    
    // Remover backdrops
    const backdrops = document.querySelectorAll('.MuiBackdrop-root, [data-state="open"].bg-black, .backdrop');
    if (backdrops.length > 0) {
      console.log(`Removendo ${backdrops.length} backdrops`);
      backdrops.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
        else el.remove();
      });
    }
    
    // Remover portais
    const portals = document.querySelectorAll('[data-radix-portal], #mui-modal-root > div');
    if (portals.length > 0) {
      console.log(`Removendo ${portals.length} portais`);
      portals.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    }
    
    console.log('Status após limpeza:', {
      backdrops: document.querySelectorAll('.MuiBackdrop-root, [data-state="open"].bg-black, .backdrop').length,
      portals: document.querySelectorAll('[data-radix-portal], #mui-modal-root > div').length
    });
  }, []);
  
  // Garantir limpeza quando o componente é desmontado
  useEffect(() => {
    return () => {
      isMounted.current = false;
      cleanupOverlays();
    };
  }, [cleanupOverlays]);
  
  // Garantir limpeza quando o modal é fechado
  useEffect(() => {
    if (!open) {
      cleanupOverlays();
    }
  }, [open, cleanupOverlays]);
  
  // Função para fechar o modal corretamente
  const handleCloseModal = useCallback(() => {
    if (saving) return;
    
    // Primeiro limpamos overlays
    cleanupOverlays();
    
    // Depois fechamos o modal
    setTimeout(() => {
      onOpenChange(false);
    }, 50);
  }, [onOpenChange, cleanupOverlays, saving]);
  
  // Função para salvar e fechar
  const handleUpdateRole = useCallback(() => {
    if (saving) return;
    
    // Primeiro limpamos qualquer overlay existente
    cleanupOverlays();
    
    // Disparamos a função de atualização
    // O hook useUsers vai fechar o modal e exibir o toast depois
    onUpdateRole();
  }, [onUpdateRole, saving, cleanupOverlays]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpenState) => {
        if (!newOpenState && !saving) {
          // Se estiver fechando, limpar overlays primeiro
          cleanupOverlays();
          setTimeout(() => onOpenChange(false), 50);
        } else {
          onOpenChange(newOpenState);
        }
      }}
    >
      <DialogContent 
        onEscapeKeyDown={handleCloseModal}
        onInteractOutside={handleCloseModal}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          cleanupOverlays();
        }}
        className="z-40 relative"
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
            onClick={handleUpdateRole} 
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
