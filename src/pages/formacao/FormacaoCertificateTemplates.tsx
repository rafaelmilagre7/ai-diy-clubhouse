
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const FormacaoCertificateTemplates = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Templates de Certificado</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Templates de Certificado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta funcionalidade está em desenvolvimento. Em breve você poderá criar e gerenciar templates de certificados personalizados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormacaoCertificateTemplates;
