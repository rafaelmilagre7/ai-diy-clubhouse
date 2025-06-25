
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SuggestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/suggestions')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Sugestões
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Detalhes da Sugestão #{id}</h1>
        <p className="text-muted-foreground">
          Visualize detalhes completos da sugestão
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Implementar nova funcionalidade de dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Seria interessante ter um dashboard mais interativo com widgets personalizáveis 
                para que cada usuário possa configurar as informações que deseja visualizar.
              </p>
              
              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  15 curtidas
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <ThumbsDown className="h-4 w-4" />
                  2
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Status:</strong> Nova</p>
                <p><strong>Categoria:</strong> Interface</p>
                <p><strong>Criada em:</strong> 15/01/2024</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SuggestionDetail;
