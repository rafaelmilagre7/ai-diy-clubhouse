import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Search,
  Mail,
  AlertCircle,
  UserCheck,
  UserX,
  Calendar,
  Filter
} from 'lucide-react';

interface OnboardingStatusTabProps {
  data?: any;
  loading?: boolean;
}

export const OnboardingStatusTab = ({ data, loading }: OnboardingStatusTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-80 bg-gray-200 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Separar usuários por status de onboarding
  const users = data?.userDetails || [];
  const completedUsers = users.filter((user: any) => user.onboarding_completed);
  const incompleteUsers = users.filter((user: any) => !user.onboarding_completed);

  // Aplicar filtros
  const getFilteredUsers = () => {
    let filtered = users;
    
    if (statusFilter === 'completed') {
      filtered = completedUsers;
    } else if (statusFilter === 'incomplete') {
      filtered = incompleteUsers;
    }

    if (searchTerm) {
      filtered = filtered.filter((user: any) => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  // Calcular estatísticas
  const totalUsers = users.length;
  const completionRate = totalUsers > 0 ? Math.round((completedUsers.length / totalUsers) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Resumo de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                <p className="text-3xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-operational" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Onboarding Completo</p>
                <p className="text-3xl font-bold text-success">{completedUsers.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{completionRate}% do total</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Onboarding Pendente</p>
                <p className="text-3xl font-bold text-revenue">{incompleteUsers.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{100 - completionRate}% do total</p>
              </div>
              <Clock className="h-8 w-8 text-revenue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                Todos ({totalUsers})
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completed')}
                size="sm"
                className="text-success"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Completos ({completedUsers.length})
              </Button>
              <Button
                variant={statusFilter === 'incomplete' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('incomplete')}
                size="sm"
                className="text-revenue"
              >
                <UserX className="h-4 w-4 mr-1" />
                Pendentes ({incompleteUsers.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Usuários {statusFilter === 'completed' ? 'com Onboarding Completo' : 
                     statusFilter === 'incomplete' ? 'com Onboarding Pendente' : ''}
          </CardTitle>
          <CardDescription>
            {filteredUsers.length} usuário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum usuário encontrado com os filtros aplicados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user: any) => (
                <UserOnboardingCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para cada card de usuário
interface UserOnboardingCardProps {
  user: any;
}

const UserOnboardingCard = ({ user }: UserOnboardingCardProps) => {
  const getStatusColor = (completed: boolean) => {
    return completed ? 'text-success bg-success/10' : 'text-revenue bg-revenue/10';
  };

  const getStatusIcon = (completed: boolean) => {
    return completed ? 
      <CheckCircle className="h-4 w-4 text-success" /> : 
      <Clock className="h-4 w-4 text-revenue" />;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>
            {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <p className="font-medium">{user.name || 'Nome não informado'}</p>
            <Badge 
              variant="outline" 
              className={getStatusColor(user.onboarding_completed)}
            >
              {getStatusIcon(user.onboarding_completed)}
              <span className="ml-1">
                {user.onboarding_completed ? 'Completo' : 'Pendente'}
              </span>
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
            <div className="flex items-center space-x-1">
              <Mail className="h-3 w-3" />
              <span>{user.email}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Criado em {formatDate(user.created_at)}</span>
            </div>
            
            {user.lastActivity && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Última atividade: {formatDate(user.lastActivity)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 text-sm">
        <div className="text-right">
          <p className="font-medium">Health Score: {user.healthScore || 0}/100</p>
          <p className="text-gray-500">Segmento: {user.segment || 'N/A'}</p>
        </div>
        
        {!user.onboarding_completed && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Implementar ação para notificar usuário
              console.log('Notificar usuário:', user.id);
            }}
          >
            <Mail className="h-3 w-3 mr-1" />
            Notificar
          </Button>
        )}
      </div>
    </div>
  );
};