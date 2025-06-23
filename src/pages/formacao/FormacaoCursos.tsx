import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { LearningCourse } from "@/lib/supabase";
import { FormacaoCursosHeader } from "@/components/formacao/cursos/FormacaoCursosHeader";
import { CursosList } from "@/components/formacao/cursos/CursosList";
import { CursoFormDialog } from "@/components/formacao/cursos/CursoFormDialog";
import { toast } from "sonner";

const FormacaoCursos = () => {
  const { profile } = useAuth();
  const [cursos, setCursos] = useState<LearningCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<LearningCourse | null>(null);
  
  // Buscar cursos
  const fetchCursos = async () => {
    setLoading(true);
    try {
      // Buscar todos os cursos
      const { data, error } = await supabase
        .from('learning_courses')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      
      // Para cada curso, verificar se ele tem restrições de acesso
      const coursesWithRestrictionInfo = await Promise.all(
        (data || []).map(async (course) => {
          const { count, error: restrictionError } = await supabase
            .from('course_access_control')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);
            
          return {
            ...course,
            is_restricted: count ? count > 0 : false
          };
        })
      );
      
      setCursos(coursesWithRestrictionInfo);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      toast.error("Não foi possível carregar os cursos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  // Abrir modal para criar novo curso
  const handleNovoCurso = () => {
    setEditingCurso(null);
    setIsDialogOpen(true);
  };

  // Abrir modal para editar curso existente
  const handleEditarCurso = (curso: LearningCourse) => {
    setEditingCurso(curso);
    setIsDialogOpen(true);
  };

  // Ações após salvar um curso
  const handleSalvarCurso = () => {
    setIsDialogOpen(false);
    fetchCursos();
  };

  // Excluir curso
  const handleExcluirCurso = async (id: string) => {
    try {
      const { error } = await supabase
        .from('learning_courses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Curso excluído com sucesso!");
      fetchCursos();
    } catch (error) {
      console.error("Erro ao excluir curso:", error);
      toast.error("Não foi possível excluir o curso. Verifique se não há módulos ou aulas vinculados.");
    }
  };

  return (
    <div className="space-y-6">
      <FormacaoCursosHeader onNovoCurso={handleNovoCurso} />
      
      <CursosList 
        cursos={cursos} 
        loading={loading} 
        onEdit={handleEditarCurso}
        onDelete={handleExcluirCurso}
        isAdmin={profile?.role === 'admin'}
      />
      
      <CursoFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        curso={editingCurso}
        onSuccess={handleSalvarCurso}
      />
    </div>
  );
};

export default FormacaoCursos;
