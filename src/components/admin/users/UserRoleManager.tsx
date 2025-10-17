
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

// CORREÇÃO BUG BAIXO 2: Melhorar type safety com interfaces mais específicas
interface UserRoleManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  availableRoles: Role[];
  onSuccess?: () => void;
}

// CORREÇÃO BUG BAIXO 2: Type guard para validação de callback
const isValidCallback = (callback: unknown): callback is () => void => {
  return typeof callback === 'function';
};

// CORREÇÃO BUG BAIXO 2: Helper para tratamento seguro de erros
const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Erro desconhecido';
};

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
      } catch (error: unknown) {
        // CORREÇÃO BUG BAIXO 2: Usar helper para tratamento seguro de erro
        console.error("Erro ao buscar papel do usuário:", error);
        toast.error("Não foi possível carregar as informações do usuário", {
          description: handleError(error)
        });
      }
    }
  };

  const handleAssignRole = async () => {
    // CORREÇÃO BUG BAIXO 2: Validação mais rigorosa de tipos
    if (!user?.id || !selectedRoleId) {
      toast.error("Dados insuficientes para atualizar o papel");
      return;
    }
    
    try {
      await assignRoleToUser(user.id, selectedRoleId);
      toast.success("Papel do usuário atualizado com sucesso");
      onOpenChange(false);
      
      // CORREÇÃO BUG BAIXO 2: Usar type guard para validar callback antes de executar
      if (isValidCallback(onSuccess)) {
        onSuccess();
      }
    } catch (error: unknown) {
      // CORREÇÃO BUG BAIXO 2: Tratamento seguro de erro com helper
      console.error("Erro ao atribuir papel:", error);
      toast.error("Não foi possível atualizar o papel do usuário", {
        description: handleError(error)
      });
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

  // CORREÇÃO BUG BAIXO 2: Helper para obter nome do usuário de forma type-safe
  const getUserDisplayName = (): string => {
    if (!user) return 'Usuário desconhecido';
    return user.name || user.email || 'Usuário';
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-dialog-sm">
        <DialogHeader>
          <DialogTitle>Alterar Função do Usuário</DialogTitle>
          <DialogDescription>
            Atribua uma nova função ao usuário {getUserDisplayName()}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Função atual</p>
            {currentRole ? (
              <Badge className="bg-muted text-foreground hover:bg-muted/80">
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
