
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
import { Role } from "@/hooks/admin/useUsers";

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: UserProfile | null;
  newRoleId: string;
  onRoleChange: (value: string) => void;
  onUpdateRole: () => void;
  saving: boolean;
  availableRoles: Role[];
}

export const UserRoleDialog = ({
  open,
  onOpenChange,
  selectedUser,
  newRoleId,
  onRoleChange,
  onUpdateRole,
  saving,
  availableRoles,
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
                    {role.is_system && <span className="ml-2 text-xs text-gray-400">(sistema)</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={onUpdateRole} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
