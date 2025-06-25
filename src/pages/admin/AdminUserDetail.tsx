
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Calendar, Activity, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { useUserDetail } from '@/hooks/admin/useUserDetail';
import LoadingScreen from '@/components/common/LoadingScreen';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminUserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading, error, refetch } = useUserDetail(id || '');

  if (loading) {
    return <LoadingScreen message="Carregando detalhes do usuário..." />;
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Usuários
          </Button>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Usuário não encontrado</h3>
            <p className="text-muted-foreground mb-4">
              O usuário solicitado não foi encontrado ou você não tem permissão para visualizá-lo.
            </p>
            <Button onClick={() => navigate('/admin/users')}>
              Voltar para Lista de Usuários
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatRole = (user: any) => {
    return user.user_roles?.name || user.role || 'Usuário';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getStatusColor = () => {
    // Usuários criados recentemente são considerados ativos
    const createdDate = new Date(user.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return createdDate > thirtyDaysAgo ? 'default' : 'secondary';
  };

  const getStatusText = () => {
    const createdDate = new Date(user.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return createdDate > thirtyDaysAgo ? 'Ativo' : 'Inativo';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Usuários
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{user.name || 'Usuário sem nome'}</h1>
        <p className="text-muted-foreground">
          Informações completas e atividades do usuário
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <p className="text-muted-foreground">{user.name || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Empresa</label>
                    <p className="text-muted-foreground">{user.company_name || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Setor</label>
                    <p className="text-muted-foreground">{user.industry || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tipo de Usuário</label>
                    <Badge variant="outline">{formatRole(user)}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Funcionalidade de atividades será implementada em breve.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Onboarding</span>
                  <span className="font-medium">
                    {user.onboarding_completed ? 'Concluído' : 'Pendente'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Data de Cadastro</span>
                  <span className="font-medium text-xs">
                    {formatDate(user.created_at)}
                  </span>
                </div>
                {user.onboarding_completed_at && (
                  <div className="flex justify-between">
                    <span className="text-sm">Onboarding Concluído</span>
                    <span className="font-medium text-xs">
                      {formatDate(user.onboarding_completed_at)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>ID:</strong> <span className="text-xs font-mono">{user.id}</span></p>
                <p><strong>Criado em:</strong> {formatDate(user.created_at)}</p>
                <p><strong>Papel:</strong> {formatRole(user)}</p>
                {user.user_roles?.description && (
                  <p><strong>Descrição do Papel:</strong> {user.user_roles.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
