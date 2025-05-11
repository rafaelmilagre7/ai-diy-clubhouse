
import { useState, useEffect } from "react";
import { UserProfile } from "@/lib/supabase";
import { Role } from "@/hooks/admin/useRoles";
import { useUserRoles } from "@/hooks/admin/useUserRoles";
import { UserRoleDialog } from "./UserRoleDialog";
import { toast } from "sonner";

interface UserRoleManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  availableRoles: Role[];
}

export function UserRoleManager({
  open,
  onOpenChange,
  user,
  availableRoles,
}: UserRoleManagerProps) {
  const { assignRoleToUser, getUserRole, isUpdating } = useUserRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [currentRole, setCurrentRole] = useState<{
    roleId: string | null;
    roleName: string | null;
  }>({ roleId: null, roleName: null });
  
  // Efeito para carregar o papel atual quando o diálogo abrir
  useEffect(() => {
    if (open && user) {
      const fetchUserRole = async () => {
        const result = await getUserRole(user.id);
        setCurrentRole({
          roleId: result.roleId,
          roleName: result.roleName
        });
        setSelectedRoleId(result.roleId ? String(result.roleId) : "");
      };
      fetchUserRole();
    }
  }, [open, user, getUserRole]);

  // Verificar se houve mudança na seleção
  const hasChanges = selectedRoleId !== currentRole.roleId && selectedRoleId !== "";

  // Função para salvar a alteração de papel
  const handleSave = async () => {
    if (!user || !selectedRoleId || !hasChanges) return;

    try {
      await assignRoleToUser(user.id, selectedRoleId);
      toast.success("Papel do usuário atualizado com sucesso");
      onOpenChange(false);
    } catch (err) {
      // Erro já tratado pelo hook
    }
  };

  // Se não tiver usuário selecionado, não renderiza nada
  if (!user) return null;

  return (
    <UserRoleDialog
      open={open}
      onOpenChange={onOpenChange}
      selectedUser={user}
      newRoleId={selectedRoleId}
      onRoleChange={setSelectedRoleId}
      onUpdateRole={handleSave}
      saving={isUpdating}
      availableRoles={availableRoles}
    />
  );
}
