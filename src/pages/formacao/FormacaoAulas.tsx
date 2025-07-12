
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { LearningModule, LearningLesson } from "@/lib/supabase/types";
import { LearningLessonWithRelations } from "@/lib/supabase/types/extended";
import { convertToLearningLessonsWithRelations } from "@/lib/supabase/utils/typeConverters";
import { useAllLessons } from "@/hooks/learning/useAllLessons";
import { toast } from "sonner";
import { FormacaoAulasHeader } from "@/components/formacao/aulas/FormacaoAulasHeader";
import { AulasList } from "@/components/formacao/aulas/AulasList";
import { AllLessonsList } from "@/components/formacao/aulas/AllLessonsList";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { NovaAulaButton } from "@/components/formacao/aulas/NovaAulaButton";

const FormacaoAulas = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  // Para visualização geral de todas as aulas (sem ID de módulo)
  const { lessons: allLessons, loading: loadingAllLessons, refetch: refetchAllLessons } = useAllLessons();
  
  // Para visualização específica de um módulo (com ID)
  const [modulo, setModulo] = useState<LearningModule | null>(null);
  const [aulas, setAulas] = useState<LearningLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAulas, setLoadingAulas] = useState(true);

  // Detectar se estamos na rota geral ou específica
  const isGeneralView = !id;
  
  console.log('FormacaoAulas: Modo de visualização:', isGeneralView ? 'Geral' : 'Módulo específico', { id });

  // Buscar detalhes do módulo
  const fetchModulo = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*, learning_courses(id, title)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setModulo(data);
    } catch (error) {
      console.error("Erro ao buscar módulo:", error);
      toast.error("Não foi possível carregar o módulo");
      navigate('/formacao/cursos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar aulas do módulo
  const fetchAulas = async () => {
    if (!id) {
      console.warn("FormacaoAulas: ID do módulo não encontrado");
      return;
    }
    
    console.log("FormacaoAulas: Buscando aulas para módulo", id);
    setLoadingAulas(true);
    
    try {
      const { data, error } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('module_id', id)
        .order('order_index');
      
      console.log("FormacaoAulas: Resposta do Supabase:", { data, error });
      
      if (error) {
        console.error("FormacaoAulas: Erro na query:", error);
        throw error;
      }
      
      console.log("FormacaoAulas: Aulas encontradas:", data?.length || 0);
      setAulas(data || []);
    } catch (error) {
      console.error("FormacaoAulas: Erro ao buscar aulas:", error);
      toast.error("Erro ao buscar aulas");
    } finally {
      setLoadingAulas(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (!isGeneralView) {
      fetchModulo();
      fetchAulas();
    } else {
      // Para visualização geral, não precisamos buscar módulo específico
      setLoading(false);
      setLoadingAulas(false);
    }
  }, [id, isGeneralView]);

  // Excluir aula
  const handleExcluirAula = async (aulaId: string) => {
    try {
      // Primeiro excluir materiais relacionados
      const { error: materiaisError } = await supabase
        .from('learning_resources')
        .delete()
        .eq('lesson_id', aulaId);
      
      if (materiaisError) throw materiaisError;
      
      // Depois excluir vídeos relacionados
      const { error: videosError } = await supabase
        .from('learning_lesson_videos')
        .delete()
        .eq('lesson_id', aulaId);
      
      if (videosError) throw videosError;
      
      // Finalmente excluir a aula
      const { error } = await supabase
        .from('learning_lessons')
        .delete()
        .eq('id', aulaId);
      
      if (error) throw error;
      
      toast.success("Aula excluída com sucesso!");
      fetchAulas();
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
      toast.error("Não foi possível excluir a aula. Verifique se não há dependências.");
    }
  };

  // Função para editar aula
  const handleEditarAula = (aula: LearningLessonWithRelations) => {
    navigate(`/formacao/aulas/${aula.id}`);
  };

  // Função para atualizar a lista após operações bem-sucedidas
  const handleSuccess = () => {
    if (isGeneralView) {
      refetchAllLessons();
    } else {
      fetchAulas();
    }
  };

  // Loading state para visualização geral
  if (isGeneralView && loadingAllLessons) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Loading state para visualização específica
  if (!isGeneralView && loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Erro quando procurando módulo específico que não existe
  if (!isGeneralView && !loading && !modulo) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Módulo não encontrado</h2>
        <p className="text-muted-foreground mt-2 mb-4">O módulo que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => navigate('/formacao/cursos')}>Voltar para Cursos</Button>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin';

  // Renderizar visualização geral de todas as aulas
  if (isGeneralView) {
    return (
      <div className="space-y-6">
        <FormacaoAulasHeader 
          titulo="Todas as Aulas"
          breadcrumb={false}
        />
        
        <AllLessonsList 
          lessons={allLessons}
          loading={loadingAllLessons} 
          onEdit={handleEditarAula}
          onDelete={handleExcluirAula}
          isAdmin={isAdmin}
          onRefresh={refetchAllLessons}
        />
      </div>
    );
  }

  // Renderizar visualização específica do módulo
  return (
    <div className="space-y-6">
      <FormacaoAulasHeader 
        titulo={modulo?.title || 'Aulas'}
        breadcrumb={true}
        moduloId={modulo?.course_id}
      >
        {isAdmin && (
          <NovaAulaButton 
            moduleId={id || ''} 
            buttonText="Nova Aula"
            onSuccess={handleSuccess}
          />
        )}
      </FormacaoAulasHeader>
      
      <AulasList 
        aulas={convertToLearningLessonsWithRelations(aulas)}
        loading={loadingAulas} 
        onEdit={handleEditarAula}
        onDelete={handleExcluirAula}
        isAdmin={isAdmin}
        onRefresh={fetchAulas}
      />
    </div>
  );
};

export default FormacaoAulas;
