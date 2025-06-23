
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';

const AdminToolEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate('/admin/tools')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Ferramenta' : 'Nova Ferramenta'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? `Editando ferramenta ID: ${id}` : 'Crie uma nova ferramenta para a plataforma'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            {isEditing ? 'Editar Ferramenta' : 'Criar Nova Ferramenta'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Configure as informações da ferramenta, categorias e benefícios.
          </p>
          
          <div className="text-sm text-muted-foreground">
            {isEditing ? `Carregando dados da ferramenta ${id}...` : 'Formulário de criação será carregado aqui.'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminToolEdit;
