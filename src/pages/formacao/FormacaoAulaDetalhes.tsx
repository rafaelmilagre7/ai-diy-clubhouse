
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { LearningLesson } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import AulaDetails from "@/components/formacao/aulas/AulaDetails";
import { AulaDeleteDialog } from "@/components/formacao/aulas/AulaDeleteDialog";

const FormacaoAulaDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [aula, setAula] = useState<LearningLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Buscar dados da aula
  const fetchAula = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_lessons')
        .select(`
          *,
          module:learning_modules(
            id,
            title,
            course_id,
            description,
            order_index,
            created_at,
            updated_at,
            course:learning_courses(id, title)
          ),
          videos:learning_lesson_videos(*),
          resources:learning_resources(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Mapear dados para o formato LearningLesson esperado
      const mappedAula: LearningLesson = {
        id: data.id,
        module_id: data.module_id,
        title: data.title,
        description: data.description,
        content: data.content,
        order_index: data.order_index,
        is_published: data.is_published || false,
        published: data.is_published || false, // Map is_published to published
        created_at: data.created_at,
        updated_at: data.updated_at,
        estimated_duration_minutes: data.estimated_duration_minutes || 0,
        difficulty_level: data.difficulty_level || 'beginner',
        ai_assistant_enabled: !!data.ai_assistant_id || false,
        ai_assistant_id: data.ai_assistant_id || null,
        ai_assistant_prompt: data.ai_assistant_prompt || null,
        cover_image_url: data.cover_image_url || null,
        // Add missing required fields with defaults
        lesson_type: data.lesson_type || 'video',
        video_url: '', // Default empty string
        video_duration_seconds: 0, // Default to 0
        // Add related data
        videos: data.videos || [],
        resources: data.resources || [],
        module: data.module ? {
          ...data.module,
          // Ensure all required LearningModule fields are present
          description: data.module.description || '',
          order_index: data.module.order_index || 0,
          created_at: data.module.created_at || new Date().toISOString(),
          updated_at: data.module.updated_at || new Date().toISOString()
        } : null
      };
      
      setAula(mappedAula);
    } catch (error) {
      console.error("Erro ao buscar aula:", error);
      toast.error("Não foi possível carregar a aula");
      navigate('/formacao/aulas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAula();
  }, [id]);

  // Função para editar aula
  const handleEditClick = () => {
    navigate(`/formacao/aulas/${id}/editar`);
  };

  // Função para confirmar exclusão
  const handleDeleteConfirm = async () => {
    if (!aula) return;
    
    try {
      // Excluir recursos relacionados primeiro
      const { error: resourcesError } = await supabase
        .from('learning_resources')
        .delete()
        .eq('lesson_id', aula.id);
      
      if (resourcesError) throw resourcesError;
      
      // Excluir vídeos relacionados
      const { error: videosError } = await supabase
        .from('learning_lesson_videos')
        .delete()
        .eq('lesson_id', aula.id);
      
      if (videosError) throw videosError;
      
      // Excluir a aula
      const { error } = await supabase
        .from('learning_lessons')
        .delete()
        .eq('id', aula.id);
      
      if (error) throw error;
      
      toast.success("Aula excluída com sucesso!");
      navigate('/formacao/aulas');
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
      toast.error("Não foi possível excluir a aula");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!aula) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Aula não encontrada</h2>
        <p className="text-muted-foreground mt-2 mb-4">A aula que você está procurando não existe ou foi removida.</p>
        <Button onClick={() => navigate('/formacao/aulas')}>Voltar para Aulas</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AulaDetails aula={aula} />
      
      <AulaDeleteDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        aula={aula}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default FormacaoAulaDetalhes;
