
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { LearningModule, LearningLesson } from "@/lib/supabase";
import { toast } from "sonner";
import { FormacaoAulasHeader } from "@/components/formacao/aulas/FormacaoAulasHeader";
import { AulasList } from "@/components/formacao/aulas/AulasList";
import { AulaWizard } from "@/components/formacao/aulas/AulaWizard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const FormacaoModuloDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [modulo, setModulo] = useState<LearningModule | null>(null);
  const [aulas, setAulas] = useState<LearningLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAulas, setLoadingAulas] = useState(true);
  const [isAulaWizardOpen, setIsAulaWizardOpen] = useState(false);
  const [editingAula, setEditingAula] = useState<LearningLesson | null>(null);

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
      toast.error("Erro ao buscar aulas");
    } finally {
      setLoadingAulas(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchModulo();
    fetchAulas();
  }, [id]);

  // Abrir modal para criar nova aula
  const handleNovaAula = () => {
    setEditingAula(null);
    setIsAulaWizardOpen(true);
  };

  // Abrir modal para editar aula existente
  const handleEditarAula = (aula: LearningLesson) => {
    setEditingAula(aula);
    setIsAulaWizardOpen(true);
  };

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

  // Ações após salvar uma aula
  const handleSalvarAula = () => {
    setIsAulaWizardOpen(false);
    fetchAulas();
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

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-6">
      <FormacaoAulasHeader 
        onNovaAula={handleNovaAula} 
        titulo={modulo.title}
        breadcrumb={true}
        moduloId={modulo.course_id}
      />
      
      <AulasList 
        aulas={aulas} 
        loading={loadingAulas} 
        onEdit={handleEditarAula}
        onDelete={handleExcluirAula}
        isAdmin={isAdmin}
      />
      
      <AulaWizard 
        open={isAulaWizardOpen}
        onOpenChange={setIsAulaWizardOpen}
        aula={editingAula}
        moduleId={id || ''}
        onSuccess={handleSalvarAula}
      />
    </div>
  );
};

export default FormacaoModuloDetalhes;
