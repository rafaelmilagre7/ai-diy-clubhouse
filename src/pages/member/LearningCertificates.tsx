
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LearningCertificates = () => {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meus Certificados</h1>
        <p className="text-muted-foreground">
          Visualize e baixe seus certificados de conclusão
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Fundamentos de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Concluído em 10/01/2024
              </div>
              <Button className="w-full gap-2">
                <Download className="h-4 w-4" />
                Baixar Certificado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearningCertificates;
