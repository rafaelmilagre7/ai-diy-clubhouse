
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LessonContent } from "@/components/learning/member/LessonContent";
import { LessonHeader } from "@/components/learning/member/LessonHeader";
import { LessonNavigation } from "@/components/learning/member/LessonNavigation";
import { LessonSidebar } from "@/components/learning/member/LessonSidebar";
import { LessonResources } from "@/components/learning/member/LessonResources";

const AulaView: React.FC = () => {
  const { cursoId, aulaId } = useParams<{ cursoId: string; aulaId: string }>();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  
  // Buscar detalhes da aula
  const { data: aula, isLoading: isLoadingAula } = useQuery({
    queryKey: ["formacao-aula", aulaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_lessons")
        .select("*")
        .eq("id", aulaId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!aulaId
  });
  
  // Buscar recursos da aula
  const { data: recursos, isLoading: isLoadingRecursos } = useQuery({
    queryKey: ["formacao-recursos", aulaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_resources")
        .select("*")
        .eq("lesson_id", aulaId)
        .order("order_index", { ascending: true });
        
      if (error) return [];
      return data || [];
    },
    enabled: !!aulaId
  });
  
  // Buscar vídeos da aula
  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["formacao-videos", aulaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_lesson_videos")
        .select("*")
        .eq("lesson_id", aulaId)
        .order("order_index", { ascending: true });
        
      if (error) return [];
      return data || [];
    },
    enabled: !!aulaId
  });
  
  // Buscar informações do módulo
  const { data: moduloData } = useQuery({
    queryKey: ["formacao-modulo-aulas", aula?.module_id],
    queryFn: async () => {
      if (!aula?.module_id) return null;
      
      // Buscar informações do módulo
      const { data: modulo, error: moduloError } = await supabase
        .from("learning_modules")
        .select("*, learning_courses!inner(*)")
        .eq("id", aula.module_id)
        .single();
        
      if (moduloError) return null;
      
      // Buscar todas as aulas do módulo
      const { data: aulas, error: aulasError } = await supabase
        .from("learning_lessons")
        .select("*")
        .eq("module_id", aula.module_id)
        .eq("published", true)
        .order("order_index", { ascending: true });
        
      if (aulasError) return { modulo, aulas: [] };
      
      return { modulo, aulas };
    },
    enabled: !!aula?.module_id
  });
  
  // Buscar progresso atual
  const { data: userProgress, refetch: refetchProgress } = useQuery({
    queryKey: ["formacao-progresso-aula", aulaId],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      
      const { data, error } = await supabase
        .from("learning_progress")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("lesson_id", aulaId)
        .maybeSingle();
        
      if (error) return null;
      
      if (data) {
        setProgress(data.progress_percentage);
      }
      
      return data;
    },
    enabled: !!aulaId
  });
  
  // Função para atualizar o progresso
  const handleProgressUpdate = async (newProgress: number) => {
    if (newProgress <= progress) return;
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    
    setProgress(newProgress);
    
    const now = new Date().toISOString();
    if (userProgress) {
      // Atualizar progresso existente
      await supabase
        .from("learning_progress")
        .update({
          progress_percentage: newProgress,
          updated_at: now,
          completed_at: newProgress >= 100 ? now : userProgress.completed_at
        })
        .eq("id", userProgress.id);
    } else {
      // Criar novo registro de progresso
      await supabase
        .from("learning_progress")
        .insert({
          user_id: userData.user.id,
          lesson_id: aulaId,
          progress_percentage: newProgress,
          started_at: now,
          completed_at: newProgress >= 100 ? now : null
        });
    }
    
    refetchProgress();
  };
  
  // Marcar aula como concluída
  const handleComplete = () => {
    handleProgressUpdate(100);
  };
  
  // Iniciar progresso quando a página carrega
  useEffect(() => {
    if (aulaId && !userProgress) {
      handleProgressUpdate(1); // 1% para marcar que começou
    }
  }, [aulaId, userProgress]);
  
  const isLoading = isLoadingAula || isLoadingRecursos || isLoadingVideos;
  
  if (isLoading) {
    return (
      <div className="container py-8">Carregando aula...</div>
    );
  }
  
  if (!aula) {
    return (
      <div className="container py-8">
        <h2 className="text-xl font-semibold">Aula não encontrada</h2>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <LessonHeader
            title={aula.title}
            moduleTitle={moduloData?.modulo?.title || ""}
            progress={progress}
          />
          
          <div className="mt-6">
            <LessonNavigation
              courseId={cursoId!}
              currentLesson={aula}
              allLessons={moduloData?.aulas || []}
              onComplete={handleComplete}
              isCompleted={progress >= 100}
            />
          </div>
          
          <div className="mt-8">
            <LessonContent
              lesson={aula}
              videos={videos || []}
              resources={recursos || []}
              onProgressUpdate={handleProgressUpdate}
            />
          </div>
        </div>
        
        <div>
          <LessonSidebar
            currentLesson={aula}
            module={moduloData?.modulo}
            lessons={moduloData?.aulas || []}
            courseId={cursoId!}
          />
        </div>
      </div>
    </div>
  );
};

export default AulaView;
