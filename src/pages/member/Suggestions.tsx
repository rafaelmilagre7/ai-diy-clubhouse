
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, TrendingUp, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Suggestions = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Sugestões</h1>
          <p className="text-muted-foreground">
            Compartilhe ideias e vote nas sugestões da comunidade
          </p>
        </div>
        
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Sugestão
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Sugestões</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              +3 novas esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mais Votadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              com mais de 10 votos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Sugestões</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              enviadas por você
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/suggestions/1')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Implementar nova funcionalidade de dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Seria interessante ter um dashboard mais interativo com widgets personalizáveis 
              para que cada usuário possa configurar as informações que deseja visualizar.
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">15 votos</span>
                </div>
                <span className="text-sm text-muted-foreground">Por João Silva</span>
                <span className="text-sm text-muted-foreground">15/01/2024</span>
              </div>
              <Button variant="outline" size="sm">
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/suggestions/2')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Melhorar sistema de notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              As notificações poderiam ter mais opções de personalização e filtros 
              para que cada usuário possa escolher o que receber.
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">8 votos</span>
                </div>
                <span className="text-sm text-muted-foreground">Por Maria Santos</span>
                <span className="text-sm text-muted-foreground">12/01/2024</span>
              </div>
              <Button variant="outline" size="sm">
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Suggestions;
