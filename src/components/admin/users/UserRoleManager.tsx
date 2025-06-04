
import { useState } from "react";
import { UserProfile } from "@/lib/supabase";
import { Role } from "@/hooks/admin/useRoles";
import { useUserRoles } from "@/hooks/admin/useUserRoles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface UserRoleManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  availableRoles: Role[];
  onSuccess?: () => void;
}

export const UserRoleManager = ({
  open,
  onOpenChange,
  user,
  availableRoles,
  onSuccess,
}: UserRoleManagerProps) => {
  const { assignRoleToUser, getUserRole, isUpdating } = useUserRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  // Quando o diálogo é aberto, buscar o papel atual do usuário
  const handleOpenChange = async (isOpen: boolean) => {
    onOpenChange(isOpen);
    
    if (isOpen && user) {
      try {
        // Resetar o papel selecionado
        setSelectedRoleId("");
        
        // Buscar o papel atual do usuário
        const roleInfo = await getUserRole(user.id);
        setCurrentRole(roleInfo.roleName);
        
        // Se o usuário já tem um papel atribuído, pré-selecionar
        if (roleInfo.roleId) {
          setSelectedRoleId(roleInfo.roleId);
        }
      } catch (error) {
        console.error("Erro ao buscar papel do usuário:", error);
        toast.error("Não foi possível carregar as informações do usuário");
      }
    }
  };

  const handleAssignRole = async () => {
    if (!user || !selectedRoleId) return;
    
    try {
      await assignRoleToUser(user.id, selectedRoleId);
      toast.success("Papel do usuário atualizado com sucesso");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao atribuir papel:", error);
      toast.error("Não foi possível atualizar o papel do usuário");
    }
  };

  // Formatar o nome do papel para exibição
  const formatRoleName = (roleName: string): string => {
    const roleMap: Record<string, string> = {
      "admin": "Administrador",
      "formacao": "Membro da Formação",
      "membro_club": "Membro do Club"
    };
    
    return roleMap[roleName.toLowerCase()] || roleName;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Alterar Função do Usuário</DialogTitle>
          <DialogDescription>
            Atribua uma nova função ao usuário {user?.name || user?.email}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Função atual</p>
            {currentRole ? (
              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                {formatRoleName(currentRole)}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">Sem função atribuída</span>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Nova função
            </label>
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {formatRoleName(role.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAssignRole}
            disabled={!selectedRoleId || isUpdating}
          >
            {isUpdating ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
