import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { LearningModule, LearningLesson } from "@/lib/supabase";
import { convertToLearningLessonsWithRelations } from "@/lib/supabase/utils/typeConverters";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ModuloHeader } from "@/components/formacao/modulos/ModuloHeader";
import { AulasList } from "@/components/formacao/aulas/AulasList";
import { NovaAulaButton } from "@/components/formacao/aulas/NovaAulaButton";

const ModuloDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, isAdmin, isFormacao } = useAuth();
  
  const [modulo, setModulo] = useState<LearningModule | null>(null);
  const [aulas, setAulas] = useState<LearningLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAulas, setLoadingAulas] = useState(true);
  const [courseTitle, setCourseTitle] = useState('Curso');
  
  const canManage = isAdmin || isFormacao;

  // Buscar detalhes do módulo
  const fetchModulo = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setModulo(data);
      
      // Buscar título do curso separadamente
      if (data.course_id) {
        const { data: courseData } = await supabase
          .from('learning_courses')
          .select('title')
          .eq('id', data.course_id)
          .single();
          
        if (courseData) {
          setCourseTitle(courseData.title);
        }
      }
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
    if (!id) return;
    
    setLoadingAulas(true);
    try {
      const { data, error } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('module_id', id)
        .order('order_index');
      
      if (error) throw error;
      
      setAulas(data || []);
    } catch (error) {
      console.error("Erro ao buscar aulas:", error);
      toast.error("Não foi possível carregar as aulas");
    } finally {
      setLoadingAulas(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchModulo();
    fetchAulas();
  }, [id]);

  // Função para atualizar a lista após operações bem-sucedidas
  const handleSuccess = () => {
    fetchAulas();
  };

  // Função para editar aula
  const handleEditarAula = (aula: LearningLesson) => {
    navigate(`/formacao/aulas/${aula.id}`);
  };

  // Função para excluir aula
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!modulo) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Módulo não encontrado</h2>
        <p className="text-muted-foreground mt-2 mb-4">O módulo que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => navigate('/formacao/cursos')}>Voltar para Cursos</Button>
      </div>
    );
  }

  const courseId = modulo.course_id;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/formacao/cursos/${courseId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para {courseTitle}
        </Button>
      </div>
      
      <ModuloHeader 
        modulo={modulo} 
        onEdit={() => {}} 
        isAdmin={isAdmin} 
      />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Aulas</h2>
        {isAdmin && (
          <NovaAulaButton 
            moduleId={id || ''} 
            buttonText="Nova Aula"
            onSuccess={handleSuccess}
          />
        )}
      </div>
      
      <AulasList 
        aulas={convertToLearningLessonsWithRelations(aulas)}
        loading={loadingAulas} 
        onEdit={handleEditarAula}
        onDelete={handleExcluirAula}
        isAdmin={canManage}
      />
    </div>
  );
};

export default ModuloDetalhes;
