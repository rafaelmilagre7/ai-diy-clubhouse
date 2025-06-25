
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Eye, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSolutions } from '@/hooks/admin/useSolutions';
import LoadingScreen from '@/components/common/LoadingScreen';

const AdminSolutions = () => {
  const navigate = useNavigate();
  const { solutions, loading, searchQuery, searchSolutions, refetch } = useSolutions();

  const formatCategory = (category: string) => {
    switch (category) {
      case 'revenue':
      case 'Receita':
        return 'Aumento de Receita';
      case 'operational':
      case 'Operacional':
        return 'Otimização Operacional';
      case 'strategy':
      case 'Estratégia':
        return 'Gestão Estratégica';
      default:
        return category;
    }
  };

  const formatDifficulty = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Básico';
      case 'intermediate':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return difficulty;
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando soluções..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Soluções</h1>
          <p className="text-muted-foreground">
            Crie e gerencie todas as soluções da plataforma ({solutions.length} soluções)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Solução
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle>Soluções ({solutions.length})</CardTitle>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar soluções..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => searchSolutions(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {solutions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? 'Nenhuma solução encontrada com os critérios de busca.' : 'Nenhuma solução encontrada.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {solutions.map((solution) => (
                <div key={solution.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{solution.title}</h3>
                    <p className="text-sm text-muted-foreground">{formatCategory(solution.category)}</p>
                    <p className="text-xs text-muted-foreground">
                      Criada em {new Date(solution.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{formatDifficulty(solution.difficulty)}</Badge>
                    <Badge variant={solution.is_published ? 'default' : 'secondary'}>
                      {solution.is_published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/solution/${solution.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/admin/solutions/${solution.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSolutions;
