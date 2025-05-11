
import { useState, useEffect } from "react";
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
import { Role } from "@/hooks/admin/useRoles";
import { UserProfile } from "@/lib/supabase";
import { useUserRoles } from "@/hooks/admin/useUserRoles";
import { Shield, User, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const { assignRoleToUser, getUserRole, isUpdating, error } = useUserRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [currentRole, setCurrentRole] = useState<{
    roleId: string | null;
    roleName: string | null;
  }>({ roleId: null, roleName: null });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Quando o diálogo abrir, buscar o papel atual do usuário
    if (open && user) {
      const fetchUserRole = async () => {
        const result = await getUserRole(user.id);
        setCurrentRole({
          roleId: result.roleId,
          roleName: result.roleName,
        });
        setSelectedRoleId(result.roleId || "");
      };

      fetchUserRole();
    }
  }, [open, user, getUserRole]);

  // Monitorar mudanças na seleção
  useEffect(() => {
    setHasChanges(selectedRoleId !== currentRole.roleId && selectedRoleId !== "");
  }, [selectedRoleId, currentRole.roleId]);

  const handleSave = async () => {
    if (!user || !selectedRoleId || !hasChanges) return;

    try {
      await assignRoleToUser(user.id, selectedRoleId);
      onOpenChange(false);
    } catch (err) {
      // Erro já tratado pelo hook
    }
  };

  const getRoleIcon = (roleName: string) => {
    if (roleName.toLowerCase() === "admin") {
      return <Shield className="h-4 w-4 mr-2 text-blue-600" />;
    }
    return <User className="h-4 w-4 mr-2 text-green-600" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Papel do Usuário</DialogTitle>
          <DialogDescription>
            {user
              ? `Alterar papel do usuário ${user.name || user.email}`
              : "Selecione um papel para o usuário"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>
                {error.message || "Ocorreu um erro ao gerenciar o papel do usuário."}
              </AlertDescription>
            </Alert>
          )}

          <div>
            <p className="text-sm mb-2 text-muted-foreground">Papel atual:</p>
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
              {currentRole.roleId ? (
                <>
                  {getRoleIcon(currentRole.roleName || "")}
                  <span className="capitalize">{currentRole.roleName}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Nenhum papel atribuído</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="role-select" className="text-sm">
              Novo papel:
            </label>
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um papel" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center">
                      {getRoleIcon(role.name)}
                      <span className="capitalize">{role.name}</span>
                      {role.is_system && (
                        <span className="ml-2 text-xs text-gray-400">(sistema)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isUpdating}>
            {isUpdating ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
