
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Loader2, MoreVertical, Search, RefreshCw, UserPlus, Download } from "lucide-react";
import { useAuth } from "@/contexts/auth";

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { hasPermission } = useAuth();

  // Verificar se o usuário tem permissões para gerenciar usuários
  const canManageUsers = hasPermission('users.view') || hasPermission('admin.all');
  const canAssignRoles = hasPermission('users.assign_roles') || hasPermission('admin.all');
  const canDeleteUsers = hasPermission('users.delete') || hasPermission('admin.all');

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers();
    }
  }, [canManageUsers]);

  const fetchUsers = async () => {
    if (!canManageUsers) return;
    
    try {
      setLoading(true);
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          name,
          role,
          role_id,
          avatar_url,
          company_name,
          industry,
          created_at,
          user_roles (
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
      }

      // Mapear os dados garantindo tipos corretos
      const mappedUsers: UserProfile[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email || '',
        name: profile.name,
        role: profile.role || 'membro_club', // Valor padrão válido
        role_id: profile.role_id,
        user_roles: profile.user_roles,
        avatar_url: profile.avatar_url,
        company_name: profile.company_name,
        industry: profile.industry,
        created_at: profile.created_at || new Date().toISOString(),
      }));

      setUsers(mappedUsers);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários: ' + error.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'formacao' | 'membro_club') => {
    if (!canAssignRoles) {
      toast.error('Você não tem permissão para alterar papéis de usuários');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Atualizar o estado local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast.success('Papel do usuário atualizado com sucesso');
    } catch (error: any) {
      console.error('Erro ao atualizar papel:', error);
      toast.error('Erro ao atualizar papel: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!canDeleteUsers) {
      toast.error('Você não tem permissão para excluir usuários');
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;

      // Remover do estado local
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      toast.success('Usuário excluído com sucesso');
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário: ' + error.message);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Nome', 'Email', 'Papel', 'Empresa', 'Setor', 'Data de Criação'],
      ...users.map(user => [
        user.name || '',
        user.email || '',
        user.role || '',
        user.company_name || '',
        user.industry || '',
        new Date(user.created_at).toLocaleDateString('pt-BR')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'formacao':
        return 'secondary';
      case 'membro_club':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'formacao':
        return 'Membro da Formação';
      case 'membro_club':
        return 'Membro do Club';
      default:
        return role;
    }
  };

  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você não tem permissão para visualizar a lista de usuários.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando usuários...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e suas permissões
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportUsers} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros da Formação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'formacao').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros do Club</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'membro_club').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de busca */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tabela de usuários */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name || 'Sem nome'}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </TableCell>
                <TableCell>{user.company_name || '-'}</TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canAssignRoles && user.role !== 'admin' && (
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, 'admin')}
                        >
                          Promover a Admin
                        </DropdownMenuItem>
                      )}
                      {canAssignRoles && user.role !== 'formacao' && (
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, 'formacao')}
                        >
                          Mover para Formação
                        </DropdownMenuItem>
                      )}
                      {canAssignRoles && user.role !== 'membro_club' && (
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, 'membro_club')}
                        >
                          Mover para Club
                        </DropdownMenuItem>
                      )}
                      {canDeleteUsers && (
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-destructive"
                        >
                          Excluir Usuário
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default UserManagement;
