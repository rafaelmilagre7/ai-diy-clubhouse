
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { useToast } from '@/hooks/use-toast';
import { ToolForm } from '@/components/admin/tools/ToolForm';
import LoadingScreen from '@/components/common/LoadingScreen';

const AdminToolEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tool, setTool] = useState<Tool | null>(null);
  const isNew = !id || id === 'new';

  useEffect(() => {
    console.log('AdminToolEdit montado', { id, isNew });
    
    if (!isNew) {
      fetchTool();
    } else {
      setLoading(false);
    }
  }, [id]);

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

  const handleSubmit = async (data: any) => {
    try {
      setSaving(true);
      console.log('Salvando ferramenta:', data);
      
      if (isNew) {
        const { error } = await supabase.from('tools').insert([data]);
        if (error) throw error;
        
        toast({
          title: 'Ferramenta criada',
          description: 'A ferramenta foi criada com sucesso.',
        });
      } else {
        const { error } = await supabase
          .from('tools')
          .update(data)
          .eq('id', id);
          
        if (error) throw error;
        
        toast({
          title: 'Ferramenta atualizada',
          description: 'As alterações foram salvas com sucesso.',
        });
      }
      
      navigate('/admin/tools');
    } catch (error: any) {
      console.error('Erro ao salvar ferramenta:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Ocorreu um erro ao tentar salvar a ferramenta.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando dados da ferramenta..." />;
  }

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-2xl font-bold mb-8">
        {isNew ? 'Nova Ferramenta' : 'Editar Ferramenta'}
      </h1>
      
      <ToolForm
        initialData={tool || undefined}
        onSubmit={handleSubmit}
        isSubmitting={saving}
      />
    </div>
  );
};

export default AdminToolEdit;
