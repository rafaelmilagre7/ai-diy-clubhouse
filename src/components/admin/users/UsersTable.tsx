import React, { useState } from "react";
import { UserProfile } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Edit, Trash2, Key, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserResetDialog } from "./UserResetDialog";

interface UsersTableProps {
  users: UserProfile[];
  loading: boolean;
  canEditRoles: boolean;
  canDeleteUsers: boolean;
  canResetPasswords: boolean;
  onEditRole: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
  onResetPassword: (user: UserProfile) => void;
  onResetUser: (user: UserProfile) => void;
  onRefresh: () => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  canEditRoles,
  canDeleteUsers,
  canResetPasswords,
  onEditRole,
  onDeleteUser,
  onResetPassword,
  onResetUser,
  onRefresh,
}) => {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const handleResetUser = (user: UserProfile) => {
    setSelectedUser(user);
    setResetDialogOpen(true);
  };

  const handleResetSuccess = () => {
    onRefresh();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
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
            {users.map((user) => (
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
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-green-600">
                    Ativo
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canEditRoles && (
                        <DropdownMenuItem onClick={() => onEditRole(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar Papel
                        </DropdownMenuItem>
                      )}
                      {canResetPasswords && (
                        <DropdownMenuItem onClick={() => onResetPassword(user)}>
                          <Key className="mr-2 h-4 w-4" />
                          Redefinir Senha
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleResetUser(user)}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Completo
                      </DropdownMenuItem>
                      {canDeleteUsers && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDeleteUser(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserResetDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        user={selectedUser}
        onSuccess={handleResetSuccess}
      />
    </>
  );
};
