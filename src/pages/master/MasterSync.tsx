import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MasterMemberSyncPanel } from '@/components/master/sync/MasterMemberSyncPanel';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MasterSync: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Sincronização Master/Membros | Viver de IA</title>
        <meta name="description" content="Sincronize a estrutura de masters e membros de equipe via CSV" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Link to="/master-dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight">
            Sincronização Master/Membros
          </h1>
          <p className="text-muted-foreground mt-2">
            Importe a estrutura completa de masters e seus membros de equipe a partir de um arquivo CSV
          </p>
        </div>

        <MasterMemberSyncPanel />
      </div>
    </>
  );
};

export default MasterSync;