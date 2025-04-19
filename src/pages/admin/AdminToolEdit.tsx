
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { useToast } from '@/hooks/use-toast';
import { ToolForm } from '@/components/admin/tools/ToolForm';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useToolForm } from '@/hooks/admin/useToolForm';
import { ToolFormValues } from '@/components/admin/tools/types/toolFormValues';

const AdminToolEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tool, setTool] = useState<Tool | null>(null);
  const toolId = id || 'new';
  const isNew = toolId === 'new';
  const { isSubmitting, handleSubmit } = useToolForm(toolId);

  useEffect(() => {
    console.log('AdminToolEdit montado', { id, isNew });
    
    if (!isNew) {
      fetchTool();
    } else {
      setLoading(false);
    }
  }, [id, isNew]);

  const fetchTool = async () => {
    try {
      setLoading(true);
      console.log('Buscando ferramenta pelo ID:', id);
      
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      console.log('Ferramenta encontrada:', data);
      setTool(data);
    } catch (error: any) {
      console.error('Erro ao carregar ferramenta:', error);
      toast({
        title: 'Erro ao carregar ferramenta',
        description: error.message || 'Ocorreu um erro ao carregar os dados da ferramenta.',
        variant: 'destructive',
      });
      navigate('/admin/tools');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ToolFormValues): Promise<boolean> => {
    console.log('Formulário enviado para processo de salvamento:', data);
    const success = await handleSubmit(data);
    
    if (success) {
      console.log('Ferramenta salva com sucesso, redirecionando...');
      // Aguardar um momento para mostrar o feedback antes de redirecionar
      setTimeout(() => navigate('/admin/tools'), 1500);
    } else {
      console.log('Erro ao salvar ferramenta, permanecendo na página');
    }
    
    return success;
  };

  if (loading) {
    return <LoadingScreen message={isNew ? "Preparando formulário..." : "Carregando dados da ferramenta..."} />;
  }

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-2xl font-bold mb-8">
        {isNew ? 'Nova Ferramenta' : 'Editar Ferramenta'}
      </h1>
      
      <ToolForm
        initialData={tool || undefined}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AdminToolEdit;
