
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const navigate = useNavigate();

  const users = [
    { id: '1', name: 'João Silva', email: 'joao@exemplo.com', role: 'Club', status: 'ativo' },
    { id: '2', name: 'Maria Santos', email: 'maria@exemplo.com', role: 'Premium', status: 'ativo' },
    { id: '3', name: 'Pedro Costa', email: 'pedro@exemplo.com', role: 'Club', status: 'inativo' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os usuários da plataforma
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle>Usuários</CardTitle>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar usuários..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{user.role}</Badge>
                  <Badge variant={user.status === 'ativo' ? 'default' : 'secondary'}>
                    {user.status}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
