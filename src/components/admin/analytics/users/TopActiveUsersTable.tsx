
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  company?: string;
  role: string;
  activityCount: number;
  lastSeen?: string;
}

interface TopActiveUsersTableProps {
  users: User[];
}

export const TopActiveUsersTable: React.FC<TopActiveUsersTableProps> = ({ users }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatLastSeen = (dateStr?: string) => {
    if (!dateStr) return 'Nunca';
    
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Badge variant="info">Admin</Badge>;
      case 'formacao':
        return <Badge variant="success">Formação</Badge>;
      default:
        return <Badge variant="neutral">Membro</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários Mais Ativos</CardTitle>
        <CardDescription>
          Baseado nas interações recentes na plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="flex justify-center items-center h-20">
            <p className="text-muted-foreground">Sem dados de usuários disponíveis</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Atividades</TableHead>
                <TableHead>Última Atividade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.company || 'N/A'}</TableCell>
                  <TableCell>{getRoleLabel(user.role)}</TableCell>
                  <TableCell>{user.activityCount}</TableCell>
                  <TableCell>{formatLastSeen(user.lastSeen)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
