import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  UserCog, 
  Key, 
  RotateCcw, 
  Trash2, 
  UserX,
  UserCheck 
} from "lucide-react";
import { UserProfile, getUserRoleName } from "@/lib/supabase";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { UserResetDialog } from "./UserResetDialog";
import { ToggleUserStatusDialog } from "./ToggleUserStatusDialog";

interface UsersTableProps {
  users: UserProfile[];
  loading: boolean;
  onEditRole: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
  onResetPassword: (user: UserProfile) => void;
  onResetUser: (user: UserProfile) => void;
  onToggleStatus: (user: UserProfile) => void;
  onRefresh: () => void;
  canEditRoles: boolean;
  canDeleteUsers: boolean;
  canResetPasswords: boolean;
  canResetUsers: boolean;
  canToggleStatus: boolean;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  onEditRole,
  onDeleteUser,
  onResetPassword,
  onResetUser,
  onToggleStatus,
  onRefresh,
  canEditRoles,
  canDeleteUsers,
  canResetPasswords,
  canResetUsers,
  canToggleStatus
}) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);

  const handleResetUser = (user: UserProfile) => {
    setSelectedUser(user);
    setResetDialogOpen(true);
  };

  const handleToggleStatus = (user: UserProfile) => {
    setSelectedUser(user);
    setToggleStatusDialogOpen(true);
  };

  const handleResetSuccess = () => {
    onRefresh();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner className="h-8 w-8 mx-auto" />
        <p className="mt-2 text-muted-foreground">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const roleName = getUserRoleName(user);
              const isActive = (user.status || 'active') === 'active';
              
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name || 'Sem nome'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleName === 'admin' ? 'default' : 'secondary'}>
                      {roleName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isActive ? 'default' : 'destructive'}>
                      {isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canEditRoles && (
                          <DropdownMenuItem onClick={() => onEditRole(user)}>
                            <UserCog className="mr-2 h-4 w-4" />
                            Editar papel
                          </DropdownMenuItem>
                        )}
                        {canResetPasswords && (
                          <DropdownMenuItem onClick={() => onResetPassword(user)}>
                            <Key className="mr-2 h-4 w-4" />
                            Redefinir senha
                          </DropdownMenuItem>
                        )}
                        {canResetUsers && (
                          <DropdownMenuItem onClick={() => handleResetUser(user)}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Resetar usuário
                          </DropdownMenuItem>
                        )}
                        {canToggleStatus && (
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                            {isActive ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Desativar usuário
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Reativar usuário
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        {canDeleteUsers && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDeleteUser(user)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir usuário
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <UserResetDialog 
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        user={selectedUser}
        onSuccess={handleResetSuccess}
      />

      <ToggleUserStatusDialog 
        open={toggleStatusDialogOpen}
        onOpenChange={setToggleStatusDialogOpen}
        user={selectedUser}
        onSuccess={handleResetSuccess}
      />
    </>
  );
};