import React from 'react';
import { Helmet } from 'react-helmet-async';
import { TeamManagement } from '@/components/team/TeamManagement';
import { useAuth } from '@/contexts/auth';
import { isUserMaster } from '@/utils/roleHelpers';
import { Card, CardContent } from '@/components/ui/card';
import { Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TeamManagementPage: React.FC = () => {
  const { profile } = useAuth();
  const isMaster = isUserMaster(profile);

  // Se não for master, mostrar mensagem de acesso negado
  if (!isMaster) {
    return (
      <>
        <Helmet>
          <title>Gestão de Equipe | Viver de IA</title>
          <meta name="description" content="Gerencie sua equipe e controle o acesso aos recursos da plataforma" />
        </Helmet>

        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
          <div className="container mx-auto px-4 py-16">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
                  <p className="text-muted-foreground mb-6">
                    Esta funcionalidade está disponível apenas para usuários Master (membro_club ou master_user).
                  </p>
                  <Link to="/dashboard">
                    <Button>
                      Voltar ao Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gestão de Equipe | Viver de IA</title>
        <meta name="description" content="Gerencie sua equipe, convide membros e controle o acesso aos recursos da plataforma" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipe</h1>
            </div>
            <p className="text-muted-foreground">
              Gerencie sua equipe e controle o acesso aos recursos da plataforma
            </p>
          </div>

          <TeamManagement />
        </div>
      </div>
    </>
  );
};

export default TeamManagementPage;
