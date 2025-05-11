
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserProfile } from "@/lib/supabase";
import { Edit2, MoreHorizontal, Key, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UsersTableProps {
  users: UserProfile[];
  loading: boolean;
  canEditRoles: boolean;
  canDeleteUsers: boolean;
  canResetPasswords: boolean;
  onEditRole: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
  onResetPassword: (user: UserProfile) => void;
}

export const UsersTable = ({
  users,
  loading,
  canEditRoles,
  canDeleteUsers,
  canResetPasswords,
  onEditRole,
  onDeleteUser,
  onResetPassword,
}: UsersTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserProfile | "roleDisplay";
    direction: "asc" | "desc";
  }>({ key: "created_at", direction: "desc" });

  const sortedUsers = useMemo(() => {
    if (loading) return [];
    
    const sortableUsers = [...users];
    
    sortableUsers.sort((a, b) => {
      // Ordenação especial para o campo de papel/role
      if (sortConfig.key === "roleDisplay") {
        const roleA = a.user_roles?.name || a.role || "member";
        const roleB = b.user_roles?.name || b.role || "member";
        
        if (sortConfig.direction === "asc") {
          return roleA.localeCompare(roleB);
        } else {
          return roleB.localeCompare(roleA);
        }
      }
      
      // Ordenação padrão para outros campos
      const aValue = a[sortConfig.key as keyof UserProfile];
      const bValue = b[sortConfig.key as keyof UserProfile];
      
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Para datas
      if (
        sortConfig.key === "created_at" &&
        typeof aValue === "string" &&
        typeof bValue === "string"
      ) {
        return sortConfig.direction === "asc"
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime();
      }
      
      return 0;
    });
    
    return sortableUsers;
  }, [users, sortConfig, loading]);

  const requestSort = (key: keyof UserProfile | "roleDisplay") => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "-";
    }
  };

  // Renderiza o papel do usuário considerando tanto o novo sistema (role_id + user_roles)
  // quanto o antigo sistema (role)
  const renderUserRole = (user: UserProfile) => {
    // Primeiro tenta pegar do novo sistema
    if (user.user_roles) {
      return (
        <span className="capitalize">
          {user.user_roles.name || "membro"}
        </span>
      );
    }
    
    // Se não tiver do novo sistema, usa o campo antigo
    return <span className="capitalize">{user.role || "membro"}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div>Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <Table className="border-collapse">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Avatar</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort("name")}
            >
              Nome
              {sortConfig.key === "name" && (
                <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort("email")}
            >
              Email
              {sortConfig.key === "email" && (
                <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort("roleDisplay")}
            >
              Papel
              {sortConfig.key === "roleDisplay" && (
                <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort("created_at")}
            >
              Criado em
              {sortConfig.key === "created_at" && (
                <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
              )}
            </TableHead>
            <TableHead className="w-12">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          ) : (
            sortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage
                      src={user.avatar_url || undefined}
                      alt={user.name || "Avatar"}
                    />
                    <AvatarFallback>
                      {getInitials(user.name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{user.name || "-"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{renderUserRole(user)}</TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>
                  {(canEditRoles || canDeleteUsers || canResetPasswords) ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canEditRoles && (
                          <DropdownMenuItem onClick={() => onEditRole(user)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Alterar Papel
                          </DropdownMenuItem>
                        )}
                        
                        {canResetPasswords && (
                          <DropdownMenuItem onClick={() => onResetPassword(user)}>
                            <Key className="mr-2 h-4 w-4" />
                            Redefinir Senha
                          </DropdownMenuItem>
                        )}
                        
                        {canDeleteUsers && (
                          <DropdownMenuItem 
                            onClick={() => onDeleteUser(user)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Usuário
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
