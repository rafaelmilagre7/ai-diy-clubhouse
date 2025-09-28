import React from 'react';
import { Helmet } from 'react-helmet-async';
import { TeamManagement } from '@/components/team/TeamManagement';

const MasterDashboard: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard Master - Gestão de Equipe | Viver de IA</title>
        <meta name="description" content="Gerencie sua equipe, convide membros e controle o acesso aos recursos da plataforma" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Master</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie sua equipe e controle o acesso aos recursos da plataforma
          </p>
        </div>

        <TeamManagement />
      </div>
    </>
  );
};

export default MasterDashboard;