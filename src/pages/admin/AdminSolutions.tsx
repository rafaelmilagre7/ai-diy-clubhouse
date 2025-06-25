
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminSolutions = () => {
  const navigate = useNavigate();

  const solutions = [
    { id: '1', title: 'Assistente IA WhatsApp', category: 'Automação', status: 'publicado', difficulty: 'Intermediário' },
    { id: '2', title: 'Chatbot para E-commerce', category: 'Vendas', status: 'rascunho', difficulty: 'Avançado' },
    { id: '3', title: 'IA para Atendimento', category: 'Suporte', status: 'publicado', difficulty: 'Básico' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Soluções</h1>
          <p className="text-muted-foreground">
            Crie e gerencie todas as soluções da plataforma
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Solução
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle>Soluções</CardTitle>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar soluções..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {solutions.map((solution) => (
              <div key={solution.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{solution.title}</h3>
                  <p className="text-sm text-muted-foreground">{solution.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{solution.difficulty}</Badge>
                  <Badge variant={solution.status === 'publicado' ? 'default' : 'secondary'}>
                    {solution.status}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSolutions;
