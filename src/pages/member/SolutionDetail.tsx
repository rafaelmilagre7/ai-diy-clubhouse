
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, BookOpen, Code, CheckCircle } from 'lucide-react';

const SolutionDetail = () => {
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
        <h1 className="text-3xl font-bold">Detalhes da Solução #{id}</h1>
        <p className="text-muted-foreground">
          Implementação detalhada da solução de IA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Assistente de IA no WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Implemente um assistente de IA completo para WhatsApp que automatiza 
                o atendimento ao cliente, qualifica leads e realiza vendas.
              </p>
              
              <div className="flex items-center gap-4">
                <Button className="gap-2">
                  <Play className="h-4 w-4" />
                  Iniciar Implementação
                </Button>
                <Button variant="outline" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Ver Documentação
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Módulo 1 - Configuração</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Módulo 2 - API WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-muted" />
                  <span className="text-sm text-muted-foreground">Módulo 3 - IA</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SolutionDetail;
