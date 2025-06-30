import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { BenefitAccessControl } from '@/components/admin/tools/BenefitAccessControl';
import { ToolForm } from '@/components/admin/tools/ToolForm';
import { useToolForm } from '@/hooks/admin/useToolForm';

const AdminToolEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<Tool | undefined>(undefined);
  const [accessControlOpen, setAccessControlOpen] = useState(false);
  const { isSubmitting, handleSubmit } = useToolForm(id || 'new');
  
  // Recuperar dados da ferramenta se for edição
  useEffect(() => {
    if (id && id !== 'new') {
      fetchTool(id);
    }
  }, [id]);

  const fetchTool = async (toolId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', toolId)
        .single();

      if (error) throw error;
      
      setInitialData(data);
    } catch (error) {
      console.error('Erro ao carregar ferramenta:', error);
      toast.error('Erro ao carregar dados da ferramenta');
    } finally {
      setIsLoading(false);
    }
  };

  // Manipulador para abrir o modal de controle de acesso
  const handleOpenAccessControl = () => {
    if (!id || id === 'new') {
      toast.error('Salve a ferramenta primeiro para gerenciar acesso');
      return;
    }
    setAccessControlOpen(true);
  };

  const showAccessControl = initialData?.has_member_benefit && id && id !== 'new';

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/tools')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {id && id !== 'new' ? 'Editar Ferramenta' : 'Nova Ferramenta'}
          </h1>
        </div>
        
        <div className="flex space-x-2">
          {showAccessControl && (
            <Button 
              onClick={handleOpenAccessControl}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Gerenciar Acesso</span>
              <span className="sm:hidden">Acesso</span>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="p-6">
          <ToolForm 
            initialData={initialData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </Card>
      )}
      
      {/* Modal de Controle de Acesso */}
      {id && id !== 'new' && (
        <BenefitAccessControl
          open={accessControlOpen}
          onOpenChange={setAccessControlOpen}
          tool={initialData as Tool}
        />
      )}
    </div>
  );
};

export default AdminToolEdit;
