import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, BarChart3, Settings, Plus } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { CreateOrganizationDialog } from '@/components/master/CreateOrganizationDialog';
import { Skeleton } from '@/components/ui/skeleton';

const MasterDashboard = () => {
  const { 
    organization, 
    teamMembers, 
    loading, 
    canAddMoreMembers 
  } = useOrganization();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Se não tem organização, mostrar dialog de criação
  useEffect(() => {
    if (!loading && !organization) {
      setShowCreateDialog(true);
    }
  }, [loading, organization]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[400px] mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[120px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <CreateOrganizationDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    );
  }

  const stats = [
    {
      title: "Membros da Equipe",
      value: teamMembers.length,
      max: organization.max_users,
      icon: Users,
      description: `${teamMembers.length}/${organization.max_users} membros`
    },
    {
      title: "Convites Pendentes",
      value: 0, // TODO: implementar contagem de convites
      icon: UserPlus,
      description: "Aguardando resposta"
    },
    {
      title: "Plano Atual",
      value: organization.plan_type.toUpperCase(),
      icon: BarChart3,
      description: "Plano ativo"
    },
    {
      title: "Status",
      value: organization.is_active ? "Ativo" : "Inativo",
      icon: Settings,
      description: organization.is_active ? "Funcionando" : "Desativado"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {organization.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua equipe e configurações
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          disabled={!canAddMoreMembers()}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Membro
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Membros Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers.slice(0, 3).map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {member.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.user_roles?.name || 'Membro'}
                    </p>
                  </div>
                  {member.is_master_user && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Master
                    </span>
                  )}
                </div>
              ))}
              {teamMembers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum membro ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Resumo da Organização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Criada em:</span>
                <span className="text-sm font-medium">
                  {new Date(organization.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Última atualização:</span>
                <span className="text-sm font-medium">
                  {new Date(organization.updated_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Plano:</span>
                <span className="text-sm font-medium capitalize">
                  {organization.plan_type}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MasterDashboard;