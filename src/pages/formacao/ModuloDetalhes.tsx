
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { LearningModule, LearningLesson } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ModuloHeader } from "@/components/formacao/modulos/ModuloHeader";
import { AulasList } from "@/components/formacao/aulas/AulasList";
import { NovaAulaButton } from "@/components/formacao/aulas/NovaAulaButton";

const ModuloDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [modulo, setModulo] = useState<LearningModule | null>(null);
  const [aulas, setAulas] = useState<LearningLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAulas, setLoadingAulas] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsAdmin(profile.role === 'admin' || profile.role === 'formacao');
    }
  }, [profile]);

  // Buscar detalhes do módulo
  const fetchModulo = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*, learning_courses(*)')
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
  const courseTitle = modulo.learning_courses?.title || 'Curso';

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
          <NovaAulaButton moduleId={id || ''} />
        )}
      </div>
      
      <AulasList 
        aulas={aulas} 
        loading={loadingAulas} 
        onEdit={() => {}}
        onDelete={() => {}}
        isAdmin={isAdmin}
        onRefresh={fetchAulas}
      />
    </div>
  );
};

export default ModuloDetalhes;
