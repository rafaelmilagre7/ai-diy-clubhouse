
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

const AdminSolutionCreate = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate('/admin/solutions')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Solução</h1>
          <p className="text-muted-foreground">
            Crie uma nova solução para a plataforma
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Nova Solução
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Use o editor de soluções para criar conteúdo interativo e educacional.
          </p>
          
          <Button onClick={() => navigate('/admin/solutions/new')}>
            Iniciar Criação
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSolutionCreate;
