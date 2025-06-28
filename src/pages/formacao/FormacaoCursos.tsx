
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { supabase } from "@/lib/supabase";
import CursosList from "@/components/formacao/cursos/CursosList";
import { FormacaoCursosHeader } from "@/components/formacao/cursos/FormacaoCursosHeader";
import { toast } from "sonner";

interface Curso {
  id: string;
  title: string;
  description: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  cover_image_url: string;
  instructor_id: string;
  category: string;
  difficulty_level: string;
  estimated_hours: number;
}

const FormacaoCursos = () => {
  const navigate = useNavigate();
  const { isAdmin } = useSimpleAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar todos os cursos
  const fetchCursos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('learning_courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map database data to expected format
      const mappedCursos: Curso[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        published: item.published || false,
        created_at: item.created_at,
        updated_at: item.updated_at,
        cover_image_url: item.cover_image_url || '',
        instructor_id: item.created_by || '',
        category: 'Geral',
        difficulty_level: 'Iniciante',
        estimated_hours: 0
      }));

      setCursos(mappedCursos);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      toast.error("Erro ao carregar cursos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  // Função para editar curso
  const handleEdit = (curso: Curso) => {
    navigate(`/formacao/cursos/${curso.id}`);
  };

  // Função para excluir curso
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('learning_courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Curso excluído com sucesso!");
      fetchCursos(); // Recarregar lista
    } catch (error) {
      console.error("Erro ao excluir curso:", error);
      toast.error("Erro ao excluir curso");
    }
  };

  return (
    <div className="space-y-6">
      <FormacaoCursosHeader />
      
      <CursosList 
        cursos={cursos}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default FormacaoCursos;
