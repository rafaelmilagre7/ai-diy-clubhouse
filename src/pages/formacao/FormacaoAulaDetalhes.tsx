
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { LearningLesson } from "@/lib/supabase";
import { AulaDetails } from "@/components/formacao/aulas/AulaDetails";
import { AulaDeleteDialog } from "@/components/formacao/aulas/AulaDeleteDialog";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

const FormacaoAulaDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [aula, setAula] = useState<LearningLesson | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Buscar detalhes da aula
  useEffect(() => {
    const fetchAula = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("learning_lessons")
          .select(`
            *,
            videos:learning_lesson_videos(*),
            resources:learning_resources(*),
            module:learning_modules(*)
          `)
          .eq("id", id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setAula(data as LearningLesson);
      } catch (error) {
        console.error("Erro ao carregar aula:", error);
        toast.error("Não foi possível carregar os detalhes da aula");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAula();
  }, [id]);
  
  const handleEditClick = () => {
    // Redirecionar para o editor de aulas
    navigate(`/formacao/aulas/${id}/editar`);
  };
  
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      if (!id) return;
      
      const { error } = await supabase
        .from("learning_lessons")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Aula excluída com sucesso");
      navigate("/formacao/aulas");
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
      toast.error("Erro ao excluir aula");
    } finally {
      setShowDeleteDialog(false);
    }
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!aula) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold">Aula não encontrada</h1>
        <p className="text-muted-foreground mt-2">
          A aula solicitada não existe ou foi removida.
        </p>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <AulaDetails 
        aula={aula} 
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />
      
      <AulaDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        aula={aula}
      />
    </div>
  );
};

export default FormacaoAulaDetalhes;
