
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { LearningLesson } from "@/lib/supabase";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { toast } from "sonner";
import { FormacaoAulasHeader } from "@/components/formacao/aulas/FormacaoAulasHeader";
import { AulasList } from "@/components/formacao/aulas/AulasList";

const FormacaoAulas = () => {
  const navigate = useNavigate();
  const { isAdmin } = useSimpleAuth();
  const [aulas, setAulas] = useState<LearningLesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar todas as aulas
  const fetchAulas = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('learning_lessons')
        .select(`
          *,
          learning_modules(
            id,
            title,
            course_id,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map database data to LearningLesson interface
      const mappedAulas: LearningLesson[] = (data || []).map(item => ({
        ...item,
        // Add compatibility fields
        published: item.is_published || false,
        difficulty_level: item.difficulty_level || 'beginner',
        video_url: '',
        video_duration_seconds: 0,
        cover_image_url: item.cover_image_url || null,
        ai_assistant_prompt: item.ai_assistant_prompt || null,
        // Map related data
        module: item.learning_modules ? {
          ...item.learning_modules,
          description: item.learning_modules.description || '',
          order_index: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : null
      }));

      setAulas(mappedAulas);
    } catch (error) {
      console.error("Erro ao buscar aulas:", error);
      toast.error("Erro ao carregar aulas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAulas();
  }, []);

  // Função para editar aula
  const handleEdit = (aula: LearningLesson) => {
    navigate(`/formacao/aulas/${aula.id}/editar`);
  };

  // Função para excluir aula
  const handleDelete = async (aulaId: string) => {
    try {
      const { error } = await supabase
        .from('learning_lessons')
        .delete()
        .eq('id', aulaId);

      if (error) throw error;

      toast.success("Aula excluída com sucesso!");
      fetchAulas(); // Recarregar lista
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
      toast.error("Erro ao excluir aula");
    }
  };

  return (
    <div className="space-y-6">
      <FormacaoAulasHeader />
      
      <AulasList 
        aulas={aulas}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isAdmin={isAdmin}
        onRefresh={fetchAulas}
      />
    </div>
  );
};

export default FormacaoAulas;
