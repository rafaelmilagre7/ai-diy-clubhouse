
import { UserProfile } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UsersTableProps {
  users: UserProfile[];
  loading: boolean;
  isAdminMaster: boolean;
  onEditRole: (user: UserProfile) => void;
}

export const UsersTable = ({
  users,
  loading,
  isAdminMaster,
  onEditRole,
}: UsersTableProps) => {
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'member':
        return 'Membro';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Carregando usuários...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Indústria</TableHead>
            <TableHead>Registrado em</TableHead>
            {isAdminMaster && <TableHead className="text-right">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user.avatar_url || undefined} alt={user.name || 'Usuário'} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.name || 'Usuário sem nome'}</span>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge className={getRoleBadgeClass(user.role)}>
                  {getRoleText(user.role)}
                </Badge>
              </TableCell>
              <TableCell>{user.company_name || '-'}</TableCell>
              <TableCell>{user.industry || '-'}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(user.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </TableCell>
              {isAdminMaster && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Gerenciar Usuário</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEditRole(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Alterar Função
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
