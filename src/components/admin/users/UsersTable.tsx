
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, UserCog, Trash2, Key } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  canAssignRoles: boolean;
  canDeleteUsers: boolean;
  canResetPasswords: boolean;
  onEditRole: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  canAssignRoles,
  canDeleteUsers,
  canResetPasswords,
  onEditRole,
  onDeleteUser,
  onResetPassword
}) => {
  if (loading) {
    return <div>Carregando usuários...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Papel</TableHead>
          <TableHead>Data de Cadastro</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant="outline">{user.role}</Badge>
            </TableCell>
            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canAssignRoles && (
                    <DropdownMenuItem onClick={() => onEditRole(user)}>
                      <UserCog className="h-4 w-4 mr-2" />
                      Alterar Papel
                    </DropdownMenuItem>
                  )}
                  {canResetPasswords && (
                    <DropdownMenuItem onClick={() => onResetPassword(user)}>
                      <Key className="h-4 w-4 mr-2" />
                      Resetar Senha
                    </DropdownMenuItem>
                  )}
                  {canDeleteUsers && (
                    <DropdownMenuItem onClick={() => onDeleteUser(user)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
