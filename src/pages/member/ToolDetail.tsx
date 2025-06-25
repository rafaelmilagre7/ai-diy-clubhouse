
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Star, Download } from 'lucide-react';

const ToolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Ferramenta #{id}</h1>
        <p className="text-muted-foreground">
          Detalhes e recursos da ferramenta de IA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                ChatGPT para Empresas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Ferramenta avançada de IA para automatizar processos empresariais, 
                criar conteúdo e otimizar operações.
              </p>
              
              <div className="flex items-center gap-4">
                <Button className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Acessar Ferramenta
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Categoria:</strong> IA Generativa</p>
                <p><strong>Preço:</strong> Freemium</p>
                <p><strong>Avaliação:</strong> 4.8/5</p>
                <p><strong>Última Atualização:</strong> 15/01/2024</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ToolDetail;
