
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, MoreHorizontal, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '@/hooks/admin/useUsers';
import LoadingScreen from '@/components/common/LoadingScreen';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const { 
    users, 
    loading, 
    isRefreshing, 
    error, 
    searchUsers, 
    fetchUsers 
  } = useUsers();

  const handleSearch = (value: string) => {
    setSearchInput(value);
    searchUsers(value);
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const formatRole = (user: any) => {
    return user.user_roles?.name || user.role || 'Usuário';
  };

  const formatStatus = (createdAt: string) => {
    // Usuários criados recentemente são considerados ativos
    const createdDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return createdDate > thirtyDaysAgo ? 'ativo' : 'inativo';
  };

  if (loading && !isRefreshing) {
    return <LoadingScreen message="Carregando usuários..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">
              Erro ao carregar usuários
            </p>
          </div>
          <Button onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Ocorreu um erro ao carregar os usuários.
            </p>
            <Button onClick={handleRefresh}>
              Recarregar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os usuários da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle>Usuários ({users.length})</CardTitle>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar usuários..." 
                className="pl-8"
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchInput ? 'Nenhum usuário encontrado com os critérios de busca.' : 'Nenhum usuário encontrado.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium">{user.name || 'Nome não informado'}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.company_name && (
                        <p className="text-xs text-muted-foreground">{user.company_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{formatRole(user)}</Badge>
                    <Badge variant={formatStatus(user.created_at) === 'ativo' ? 'default' : 'secondary'}>
                      {formatStatus(user.created_at)}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
