
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileEdit } from 'lucide-react';

const SolutionEditor = () => {
  const { id } = useParams();
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
          <h1 className="text-3xl font-bold tracking-tight">Editor de Solução</h1>
          <p className="text-muted-foreground">
            Editando solução ID: {id}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Editor Avançado de Soluções
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Use o editor completo para modificar módulos, conteúdo e recursos da solução.
          </p>
          
          <div className="text-sm text-muted-foreground">
            Carregando editor para solução {id}...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SolutionEditor;
