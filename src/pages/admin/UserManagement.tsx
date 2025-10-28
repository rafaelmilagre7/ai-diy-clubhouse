
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  RefreshCw, 
  UserCheck, 
  UserPlus,
  Shield,
  Crown,
  AlertCircle,
  Settings
} from 'lucide-react';
import { useUsers } from '@/hooks/admin/useUsers';
import { useUserRoles } from '@/hooks/admin/useUserRoles';
import { useRoles, Role } from '@/hooks/admin/useRoles';
import { UserProfile } from '@/lib/supabase';
import { UserRoleDialog } from '@/components/admin/users/UserRoleDialog';
import { getUserRoleName } from '@/lib/supabase/types';
import { toast } from 'sonner';

export default function UserManagement() {
  const { 
    users, 
    loading, 
    isRefreshing, 
    searchQuery, 
    setSearchQuery,
    fetchUsers,
    canManageUsers,
    canAssignRoles,
    currentPage,
    currentFilter
  } = useUsers();

  const { assignRoleToUser, isUpdating: isAssigningRole } = useUserRoles();
  const { roles } = useRoles();
  
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRoleId, setNewRoleId] = useState<string>('');
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  // Converter roles do useRoles para o formato esperado
  const availableRoles: Role[] = useMemo(() => {
    return roles.map(role => ({
      ...role,
      permissions: role.permissions || {}
    }));
  }, [roles]);

  const handleRoleChange = (userId: string, currentRoleId: string | null) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setNewRoleId(currentRoleId || '');
      setShowRoleDialog(true);
    }
  };

  const handleUpdateRole = async () => {
    // Validação com mensagem clara
    if (!selectedUser) {
      console.error('❌ [USER-MANAGEMENT] Usuário não selecionado');
      toast.error('Erro', { description: 'Nenhum usuário selecionado' });
      throw new Error('Usuário não selecionado');
    }
    
    if (!newRoleId) {
      console.error('❌ [USER-MANAGEMENT] Papel não selecionado');
      toast.error('Erro', { description: 'Selecione um papel' });
      throw new Error('Papel não selecionado');
    }
    
    try {
      console.log('🔄 [USER-MANAGEMENT] Iniciando atualização de role:', {
        userId: selectedUser.id.substring(0, 8) + '***',
        userName: selectedUser.name || selectedUser.email,
        currentRoleId: selectedUser.role_id,
        newRoleId: newRoleId
      });
      
      const result = await assignRoleToUser(selectedUser.id, newRoleId);
      
      console.log('✅ [USER-MANAGEMENT] Role atualizada no banco:', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ [USER-MANAGEMENT] Erro ao atualizar papel do usuário:', error);
      throw error;
    }
  };

  // Callback chamado APÓS sucesso da atualização de role
  const handleRoleUpdateSuccess = () => {
    console.log('🔄 [USER-MANAGEMENT] Sucesso! Atualizando interface...');
    console.log('📄 Parâmetros atuais:', { currentPage, currentFilter });
    
    // Forçar refresh (handleRefresh já usa currentPage e currentFilter internamente)
    fetchUsers();
    
    // Limpar estado do dialog
    setSelectedUser(null);
    setNewRoleId('');
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'destructive';
      case 'formacao':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return <Crown className="h-3 w-3" />;
      case 'formacao':
        return <Shield className="h-3 w-3" />;
      default:
        return <UserCheck className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Acesso Negado</h3>
          <p className="mt-2 text-muted-foreground">
            Você não tem permissão para gerenciar usuários.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Administre usuários e configure suas permissões
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={fetchUsers}
            disabled={isRefreshing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou empresa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? 'carregando...' : 'usuários no sistema'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => getUserRoleName(u) === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">com acesso total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formação</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => getUserRoleName(u) === 'formacao').length}
            </div>
            <p className="text-xs text-muted-foreground">equipe formação</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => {
                const role = getUserRoleName(u);
                return role === 'membro_club' || role === 'user' || !role;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">usuários padrão</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Management Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Controle de Usuários</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                  <div className="h-12 w-12 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                  <div className="h-8 w-24 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum usuário encontrado</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery 
                  ? 'Tente ajustar os filtros de pesquisa.' 
                  : 'Aguardando carregamento dos usuários ou não há usuários cadastrados no sistema.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => {
                const roleName = getUserRoleName(user);
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10">
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="font-semibold">
                          {user.name || 'Nome não informado'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        {user.company_name && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Empresa:</span> {user.company_name}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Membro desde {formatDate(user.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge variant={getRoleBadgeVariant(roleName)} className="gap-1">
                        {getRoleIcon(roleName)}
                        <span className="capitalize">
                          {roleName === 'membro_club' ? 'Membro Club' : 
                           roleName === 'admin' ? 'Administrador' :
                           roleName === 'formacao' ? 'Formação' : roleName}
                        </span>
                      </Badge>
                      
                      {canAssignRoles && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRoleChange(user.id, user.role_id)}
                          disabled={isAssigningRole}
                        >
                          <Settings className="mr-1 h-3 w-3" />
                          Configurar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Management Dialog */}
      <UserRoleDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        selectedUser={selectedUser}
        newRoleId={newRoleId}
        onRoleChange={setNewRoleId}
        onUpdateRole={handleUpdateRole}
        saving={isAssigningRole}
        availableRoles={availableRoles}
        onRoleUpdateSuccess={handleRoleUpdateSuccess}
      />
    </div>
  );
}
