
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, LearningLesson } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import AulaStepWizard from '@/components/formacao/aulas/wizard/AulaStepWizard';

const FormacaoAulaEditar = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [aula, setAula] = useState<LearningLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(true);

  // Buscar dados da aula ao carregar a página
  useEffect(() => {
    const fetchAula = async () => {
      if (!id) {
        toast.error("ID da aula não fornecido");
        navigate('/formacao/aulas');
        return;
      }

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('learning_lessons')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error("Erro ao buscar aula:", error);
          toast.error("Erro ao carregar aula: " + error.message);
          navigate('/formacao/aulas');
          return;
        }

        if (!data) {
          toast.error("Aula não encontrada");
          navigate('/formacao/aulas');
          return;
        }

        setAula(data as LearningLesson);
      } catch (error: any) {
        console.error("Erro ao buscar aula:", error);
        toast.error("Erro ao carregar aula: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAula();
  }, [id, navigate]);

  // Função para voltar à página anterior
  const handleGoBack = () => {
    navigate(`/formacao/aulas/${id}`);
  };

  // Função chamada quando a edição é concluída com sucesso
  const handleEditSuccess = () => {
    toast.success("Aula atualizada com sucesso!");
    navigate(`/formacao/aulas/${id}`);
  };

  // Função para fechar o wizard e voltar
  const handleWizardClose = () => {
    setWizardOpen(false);
    handleGoBack();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para detalhes da aula
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Carregando aula...</span>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold">
            Editar Aula: {aula?.title}
          </h1>
          
          {/* Modal de edição usando o wizard existente */}
          <AulaStepWizard 
            open={wizardOpen}
            onOpenChange={setWizardOpen}
            aula={aula}
            moduleId={aula?.module_id}
            onSuccess={handleEditSuccess}
            onClose={handleWizardClose}
          />
        </>
      )}
    </div>
  );
};

export default FormacaoAulaEditar;
