
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, UserPlus } from 'lucide-react';

interface UsersHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  canManageUsers: boolean;
}

export const UsersHeader: React.FC<UsersHeaderProps> = ({
  searchQuery,
  onSearch,
  onRefresh,
  isRefreshing,
  canManageUsers
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
        <p className="text-muted-foreground">Administre usuários e suas permissões</p>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Buscar usuários..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-64"
        />
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
        {canManageUsers && (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Convidar Usuário
          </Button>
        )}
      </div>
    </div>
  );
};
