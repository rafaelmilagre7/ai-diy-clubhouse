import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Users, MoreVertical, Mail, MessageSquare, Ban, UserCheck,
  Calendar, Activity, Target, ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  created_at: string;
  onboarding_completed: boolean;
  user_roles?: { name: string }[];
  healthScore: number;
  lastActivity?: string;
  activityCount: number;
  segment: string;
}

interface UserDetailsTableProps {
  users: UserDetail[];
  loading?: boolean;
  onUserAction: (userId: string, action: string) => void;
}

export const UserDetailsTable = ({ users, loading, onUserAction }: UserDetailsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = users.slice(startIndex, endIndex);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'Power User': return 'bg-success/10 text-success';
      case 'Ativo': return 'bg-operational/10 text-operational';
      case 'Dormentes': return 'bg-warning/10 text-warning';
      case 'Em Risco': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleDisplayName = (roleName?: string) => {
    const roleMap: Record<string, string> = {
      'admin': 'Administrador',
      'membro_club': 'Membro Club',
      'formacao': 'Formação',
      'hands_on': 'Hands On'
    };
    return roleMap[roleName || ''] || roleName || 'Membro';
  };

  const formatLastActivity = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Detalhes dos Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-operational" />
            Detalhes dos Usuários
          </div>
          <Badge variant="outline">{users.length} usuários</Badge>
        </CardTitle>
        <CardDescription>
          Lista detalhada de usuários com métricas e ações disponíveis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tabela */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>Última Atividade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{user.name || 'Nome não informado'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground">
                          Cadastrado {formatLastActivity(user.created_at)}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline">
                        {getRoleDisplayName(user.user_roles?.[0]?.name)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getSegmentColor(user.segment)}>
                        {user.segment}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Progress value={user.healthScore} className="w-16 h-2" />
                          <span className="text-sm font-medium">{user.healthScore}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.activityCount} atividades
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {formatLastActivity(user.lastActivity)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {user.onboarding_completed ? (
                          <div title="Onboarding completo">
                            <UserCheck className="h-4 w-4 text-success" />
                          </div>
                        ) : (
                          <div title="Onboarding pendente">
                            <Calendar className="h-4 w-4 text-warning" />
                          </div>
                        )}
                        <div title={`Health Score: ${user.healthScore}`}>
                          <Activity 
                            className={`h-4 w-4 ${
                              user.healthScore > 70 ? 'text-success' :
                              user.healthScore > 40 ? 'text-warning' : 'text-destructive'
                            }`}
                          />
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onUserAction(user.id, 'view')}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver Perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUserAction(user.id, 'message')}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Enviar Mensagem
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUserAction(user.id, 'email')}>
                            <Mail className="mr-2 h-4 w-4" />
                            Enviar Email
                          </DropdownMenuItem>
                          {!user.onboarding_completed && (
                            <DropdownMenuItem onClick={() => onUserAction(user.id, 'nudge')}>
                              <Target className="mr-2 h-4 w-4" />
                              Nudge Onboarding
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => onUserAction(user.id, 'suspend')}
                            className="text-destructive"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Suspender
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Exibindo {startIndex + 1}-{Math.min(endIndex, users.length)} de {users.length} usuários
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};