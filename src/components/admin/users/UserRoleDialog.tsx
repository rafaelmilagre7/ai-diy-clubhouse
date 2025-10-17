
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
import { Shield, User, Loader2 } from "lucide-react";
import { UserProfile } from "@/lib/supabase";
import { Role } from "@/hooks/admin/useRoles";

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: UserProfile | null;
  newRoleId: string;
  onRoleChange: (value: string) => void;
  onUpdateRole: () => void;
  saving: boolean;
  loading?: boolean;
  availableRoles: Role[];
  // CORREÇÃO BUG MÉDIO 3: Adicionar callback para sincronização imediata
  onRoleUpdateSuccess?: () => void;
}

export const UserRoleDialog = ({
  open,
  onOpenChange,
  selectedUser,
  newRoleId,
  onRoleChange,
  onUpdateRole,
  saving,
  loading = false,
  availableRoles,
  onRoleUpdateSuccess,
}: UserRoleDialogProps) => {
  const getUserName = () => {
    return selectedUser?.name || selectedUser?.email || 'Usuário';
  };

  const getRoleIcon = (roleName: string) => {
    switch(roleName.toLowerCase()) {
      case 'admin':
        return <Shield className="h-4 w-4 mr-2 text-blue-600" />;
      case 'moderator':
        return <Shield className="h-4 w-4 mr-2 text-purple-600" />;
      default:
        return <User className="h-4 w-4 mr-2 text-green-600" />;
    }
  };

  // CORREÇÃO BUG MÉDIO 3: Handler melhorado com callback de sincronização
  const handleUpdateRole = async () => {
    console.log('🔄 [USER-ROLE-DIALOG] Iniciando atualização de role');
    
    try {
      await onUpdateRole();
      console.log('✅ [USER-ROLE-DIALOG] Role atualizado com sucesso');
      
      // Executar callback de sucesso para sincronização imediata
      if (onRoleUpdateSuccess) {
        console.log('🔄 [USER-ROLE-DIALOG] Executando callback de sincronização');
        onRoleUpdateSuccess();
      }
      
      // Fechar dialog automaticamente após sucesso
      console.log('🚪 [USER-ROLE-DIALOG] Fechando dialog após sucesso');
      onOpenChange(false);
      
    } catch (error) {
      console.error('❌ [USER-ROLE-DIALOG] Erro na atualização:', error);
      // Em caso de erro, não fechar o dialog para o usuário poder tentar novamente
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Papel do Usuário</DialogTitle>
          <DialogDescription>
            Altere o papel do usuário {getUserName()}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-aurora-primary" />
              <span className="ml-2">Carregando papel atual...</span>
            </div>
          ) : (
            <Select value={newRoleId} onValueChange={onRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um papel" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center">
                      {getRoleIcon(role.name)}
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                      {role.is_system && <span className="ml-2 text-xs text-muted-foreground">(sistema)</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving || loading}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateRole} disabled={saving || loading}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
