import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { LearningModule, LearningLesson } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ModuloHeader } from "@/components/formacao/modulos/ModuloHeader";
import { AulasList } from "@/components/formacao/aulas/AulasList";
import { useAuth } from "@/contexts/auth";
import { NovoModuloDialog } from "@/components/formacao/modulos/NovoModuloDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

// Interface para tipagem do módulo com o curso
interface ModuloWithCourse extends LearningModule {
  learning_courses?: {
    id: string;
    title: string;
  };
}

const ModuloDetalhes: React.FC = () => {
  const { cursoId, moduloId } = useParams<{ cursoId: string; moduloId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  
  // Buscar detalhes do módulo
  const { data: modulo, isLoading: isLoadingModulo } = useQuery({
    queryKey: ["formacao-modulo", moduloId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_modules")
        .select("*, learning_courses!inner(*)")
        .eq("id", moduloId)
        .single();
        
      if (error) throw error;
      return data as ModuloWithCourse;
    },
    enabled: !!moduloId
  });
  
  // Buscar aulas do módulo
  const { data: aulas, isLoading: isLoadingAulas, refetch: refetchAulas } = useQuery({
    queryKey: ["formacao-aulas", moduloId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_lessons")
        .select("*")
        .eq("module_id", moduloId)
        .order("order_index", { ascending: true });
        
      if (error) throw error;
      return data;
    },
    enabled: !!moduloId
  });
  
  // Função para excluir o módulo
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('learning_modules')
        .delete()
        .eq('id', moduloId);
        
      if (error) throw error;
      toast.success("Módulo excluído com sucesso!");
      navigate(`/formacao/cursos/${cursoId}`);
    } catch (error) {
      console.error("Erro ao excluir módulo:", error);
      toast.error("Ocorreu um erro ao excluir o módulo. Tente novamente.");
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };
  
  const isLoading = isLoadingModulo || isLoadingAulas;
  
  if (isLoading) {
    return (
      <div className="container py-8">Carregando detalhes do módulo...</div>
    );
  }
  
  if (!modulo) {
    return (
      <div className="container py-8">
        <h2 className="text-xl font-semibold">Módulo não encontrado</h2>
        <p className="text-muted-foreground mt-2 mb-4">O módulo que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => navigate(`/formacao/cursos/${cursoId}`)}>Voltar para o curso</Button>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate(`/formacao/cursos/${cursoId}`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para o curso
      </Button>
      
      <ModuloHeader 
        modulo={modulo} 
        cursoTitle={modulo.learning_courses?.title || ""}
      />
      
      <div className="flex justify-end my-4">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Aula
        </Button>
      </div>
      
      <AulasList 
        aulas={aulas || []} 
        moduloId={moduloId!}
        cursoId={cursoId!}
        onSuccess={refetchAulas}
      />
      
      <div className="flex justify-end mt-8">
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
          Excluir Módulo
        </Button>
      </div>
      
      {/* Modals */}
      <NovoModuloDialog 
        open={open} 
        onOpenChange={setOpen} 
        modulo={null}
        cursoId={cursoId!}
        onSuccess={refetchAulas}
      />
      
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Tem certeza que deseja excluir este módulo?"
        description="Esta ação é irreversível. Todas as aulas associadas a este módulo também serão excluídas."
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ModuloDetalhes;
