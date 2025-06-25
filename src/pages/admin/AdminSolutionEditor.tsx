
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, Settings } from 'lucide-react';

const AdminSolutionEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/solutions')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Soluções
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Editor de Solução #{id}</h1>
        <p className="text-muted-foreground">
          Editar e gerenciar conteúdo da solução
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações da Solução
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Configure as informações básicas, módulos e recursos da solução.
              </p>
              
              <div className="flex items-center gap-4">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Visualizar
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
                <p><strong>Status:</strong> Rascunho</p>
                <p><strong>Módulos:</strong> 3</p>
                <p><strong>Recursos:</strong> 5</p>
                <p><strong>Última Edição:</strong> Hoje</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSolutionEditor;
