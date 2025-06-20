import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { LearningCourse, LearningModule } from "@/lib/supabase";
import { toast } from "sonner";
import { CursoHeader } from "@/components/formacao/cursos/CursoHeader";
import { ModulosList } from "@/components/formacao/modulos/ModulosList";
import { ModuloFormDialog } from "@/components/formacao/modulos/ModuloFormDialog";
import { CursoFormDialog } from "@/components/formacao/cursos/CursoFormDialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const FormacaoCursoDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [curso, setCurso] = useState<LearningCourse | null>(null);
  const [modulos, setModulos] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingModulos, setLoadingModulos] = useState(true);
  const [isModuloDialogOpen, setIsModuloDialogOpen] = useState(false);
  const [isCursoDialogOpen, setIsCursoDialogOpen] = useState(false);
  const [editingModulo, setEditingModulo] = useState<LearningModule | null>(null);

  // Buscar detalhes do curso
  const fetchCurso = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setCurso(data);
    } catch (error) {
      console.error("Erro ao buscar curso:", error);
      toast.error("Não foi possível carregar o curso");
      navigate('/formacao/cursos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar módulos do curso
  const fetchModulos = async () => {
    if (!id) return;
    
    setLoadingModulos(true);
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('course_id', id)
        .order('order_index');
      
      if (error) throw error;
      
      setModulos(data || []);
    } catch (error) {
      console.error("Erro ao buscar módulos:", error);
    } finally {
      setLoadingModulos(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchCurso();
    fetchModulos();
  }, [id]);

  // Abrir modal para criar novo módulo
  const handleNovoModulo = () => {
    setEditingModulo(null);
    setIsModuloDialogOpen(true);
  };
  
  // Abrir modal para editar curso
  const handleEditarCurso = () => {
    setIsCursoDialogOpen(true);
  };

  // Abrir modal para editar módulo existente
  const handleEditarModulo = (modulo: LearningModule) => {
    setEditingModulo(modulo);
    setIsModuloDialogOpen(true);
  };

  // Excluir módulo
  const handleExcluirModulo = async (moduloId: string) => {
    try {
      const { error } = await supabase
        .from('learning_modules')
        .delete()
        .eq('id', moduloId);
      
      if (error) throw error;
      
      toast.success("Módulo excluído com sucesso!");
      fetchModulos();
    } catch (error) {
      console.error("Erro ao excluir módulo:", error);
      toast.error("Não foi possível excluir o módulo. Verifique se não há aulas vinculadas.");
    }
  };

  // Ações após salvar um módulo
  const handleSalvarModulo = () => {
    setIsModuloDialogOpen(false);
    fetchModulos();
  };
  
  // Ações após salvar o curso
  const handleSalvarCurso = () => {
    setIsCursoDialogOpen(false);
    fetchCurso();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Curso não encontrado</h2>
        <p className="text-muted-foreground mt-2 mb-4">O curso que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => navigate('/formacao/cursos')}>Voltar para Cursos</Button>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-6">
      <CursoHeader 
        curso={curso} 
        onNovoModulo={handleNovoModulo}
        onEditarCurso={handleEditarCurso}
        isAdmin={isAdmin} 
      />
      
      <ModulosList 
        modulos={modulos} 
        loading={loadingModulos} 
        onEdit={handleEditarModulo}
        onDelete={handleExcluirModulo}
        isAdmin={isAdmin}
      />
      
      <ModuloFormDialog 
        open={isModuloDialogOpen}
        onOpenChange={setIsModuloDialogOpen}
        modulo={editingModulo}
        cursoId={id || ''}
        onSuccess={handleSalvarModulo}
      />
      
      {curso && (
        <CursoFormDialog 
          open={isCursoDialogOpen}
          onOpenChange={setIsCursoDialogOpen}
          curso={curso}
          onSuccess={handleSalvarCurso}
        />
      )}
    </div>
  );
};

export default FormacaoCursoDetalhes;
