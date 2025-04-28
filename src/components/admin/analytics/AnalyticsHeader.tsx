
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AnalyticsHeader = () => {
  // Função para baixar relatório de analytics em CSV
  const handleDownloadReport = () => {
    // Esta é uma implementação básica - em um ambiente real,
    // isto criaria um endpoint específico para download de relatórios
    alert("Funcionalidade de download de relatórios será implementada em breve.");
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Visualize métricas e análises detalhadas da plataforma.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 gap-1"
          onClick={handleDownloadReport}
        >
          <Download className="h-4 w-4 mr-1" />
          Exportar Relatório
        </Button>
      </div>
    </div>
  );
};
