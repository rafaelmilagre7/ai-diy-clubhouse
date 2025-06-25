
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Share, Calendar } from 'lucide-react';

const LearningCertificates = () => {
  const certificates = [
    {
      id: '1',
      title: 'Fundamentos de IA',
      completedAt: '15/01/2024',
      course: 'Introdução à Inteligência Artificial',
      score: 95
    },
    {
      id: '2',
      title: 'IA para Negócios',
      completedAt: '10/01/2024',
      course: 'Aplicações Empresariais de IA',
      score: 88
    }
  ];

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meus Certificados</h1>
        <p className="text-muted-foreground">
          Certificados conquistados nos cursos concluídos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((certificate) => (
          <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                {certificate.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {certificate.course}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Concluído em {certificate.completedAt}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    Nota: {certificate.score}%
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share className="h-4 w-4" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {certificates.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum certificado ainda</h3>
            <p className="text-muted-foreground">
              Complete cursos para ganhar certificados e mostrar suas conquistas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningCertificates;
