
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FormacaoReports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">
          Relatórios da área de formação
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Relatórios de Formação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Relatórios em desenvolvimento...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormacaoReports;
