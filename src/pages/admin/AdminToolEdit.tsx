
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ToolForm } from '@/components/admin/tools/ToolForm';
import { useTool } from '@/hooks/admin/useTool';
import { useToolForm } from '@/hooks/admin/useToolForm';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const AdminToolEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== 'new';
  
  // Buscar dados da ferramenta se estiver editando
  const { 
    data: toolData, 
    isLoading: isLoadingTool, 
    error: toolError 
  } = useTool(isEditing ? id || null : null);
  
  // Hook para salvar ferramenta
  const { handleSubmit, isSubmitting } = useToolForm(id || 'new');

  // Callback após salvamento bem-sucedido
  const handleSaveSuccess = () => {
    navigate('/admin/tools');
  };

  // Loading state
  if (isLoadingTool) {
    return <LoadingScreen message="Carregando ferramenta..." />;
  }

  // Error state
  if (toolError) {
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
          <h1 className="text-3xl font-bold tracking-tight">Erro ao Carregar Ferramenta</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Ferramenta Não Encontrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Não foi possível carregar os dados da ferramenta. 
                Verifique se o ID está correto ou se a ferramenta ainda existe.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4">
              <Button onClick={() => navigate('/admin/tools')}>
                Voltar para Lista de Ferramentas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {isEditing 
              ? `Editando: ${toolData?.name || 'Ferramenta'}` 
              : 'Crie uma nova ferramenta para a plataforma'
            }
          </p>
        </div>
      </div>

      <ToolForm
        initialData={toolData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
};

export default AdminToolEdit;
