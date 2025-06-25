
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ThumbsUp, MessageCircle, Share } from 'lucide-react';

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
          Voltar
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Sugestão #{id}</h1>
        <p className="text-muted-foreground">
          Detalhes da sugestão da comunidade
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>IA para Análise de Sentimentos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sugerido por João Silva • 15 votos • 2 dias atrás
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Criar uma solução de IA que analise sentimentos em comentários de redes sociais, 
                reviews de produtos e feedback de clientes, ajudando empresas a entender melhor 
                a percepção do público sobre seus produtos e serviços.
              </p>
              
              <div className="flex items-center gap-4">
                <Button className="gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Votar (15)
                </Button>
                <Button variant="outline" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Comentar
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share className="h-4 w-4" />
                  Compartilhar
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
                <p><strong>Status:</strong> Em Análise</p>
                <p><strong>Categoria:</strong> IA</p>
                <p><strong>Complexidade:</strong> Média</p>
                <p><strong>Votos:</strong> 15</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SuggestionDetail;
