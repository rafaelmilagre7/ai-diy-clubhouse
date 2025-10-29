
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LessonContent } from "@/components/learning/member/LessonContent";
import { LessonNavigation } from "@/components/learning/member/LessonNavigation";
import { LessonHeader } from "@/components/learning/member/LessonHeader";
import { LessonSidebar } from "@/components/learning/member/LessonSidebar";
import { LessonResources } from "@/components/learning/member/LessonResources";
import { LessonCompletionModal } from "@/components/learning/completion/LessonCompletionModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { VideoPlayer } from "@/components/formacao/aulas/VideoPlayer";
import { VideoDisplay } from "@/components/formacao/aulas/VideoDisplay";
import { useLessonProgress } from "@/hooks/learning/useLessonProgress";

const AulaView: React.FC = () => {
  const { cursoId, aulaId } = useParams<{ cursoId: string; aulaId: string }>();
  const navigate = useNavigate();
  const [videoProgresses, setVideoProgresses] = useState<Record<string, number>>({});
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  
  // ✅ Sistema binário integrado (Fase 1 + Fase 2)
  const { 
    isCompleted, 
    completeLesson,
    isUpdating 
  } = useLessonProgress({ lessonId: aulaId });
  
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
  
  // Efeito para selecionar o primeiro vídeo quando os vídeos forem carregados
  useEffect(() => {
    if (videos && videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0]);
    }
  }, [videos, selectedVideo]);
  
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
      
      // Inicializar o estado com os progressos existentes
      if (data && data.video_progress) {
        setVideoProgresses(data.video_progress);
      }
      
      return data;
    },
    enabled: !!aulaId
  });
  
  // ❌ MUTATION DESABILITADA: Sistema progressivo foi desabilitado
  // Usar apenas useLessonProgress (sistema binário: 1% ou 100%)
  const updateProgressMutation = useMutation({
    mutationFn: async ({ 
      progress, 
      videoProgress 
    }: { 
      progress: number, 
      videoProgress: Record<string, number> 
    }) => {
      console.warn('[AULA-VIEW] ⚠️ updateProgressMutation desabilitada (sistema progressivo)');
      return null;
      
      /* CÓDIGO ORIGINAL COMENTADO - NÃO USAR:
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      
      const now = new Date().toISOString();
      
      if (userProgress) {
        const { data, error } = await supabase
          .from("learning_progress")
          .update({
            progress_percentage: progress,
            video_progress: videoProgress,
            updated_at: now,
            completed_at: progress >= 100 ? now : userProgress.completed_at
          })
          .eq("id", userProgress.id)
          .select();
          
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("learning_progress")
          .insert({
            user_id: userData.user.id,
            lesson_id: aulaId,
            progress_percentage: progress,
            video_progress: videoProgress,
            started_at: now,
            completed_at: progress >= 100 ? now : null
          })
          .select();
          
        if (error) throw error;
        return data;
      }
      */
    },
    onSuccess: () => {
      console.log('[AULA-VIEW] ℹ️ updateProgressMutation.onSuccess (desabilitada)');
    },
    onError: (error) => {
      console.warn('[AULA-VIEW] ⚠️ updateProgressMutation.onError (desabilitada)', error);
    }
  });
  
  // ❌ DESABILITADO: Sistema progressivo conflita com sistema binário
  // Este tracking progressivo foi desabilitado para evitar conflito com useLessonProgress
  // Agora usamos apenas: 1% (iniciada) ou 100% (concluída)
  
  // Função DESABILITADA para atualizar o progresso de um vídeo específico
  const handleVideoProgress = (videoId: string, progress: number) => {
    // NÃO FAZ NADA - sistema progressivo desabilitado
    console.log('[AULA-VIEW] ⚠️ handleVideoProgress desabilitado (sistema progressivo)');
    return;
    
    /* CÓDIGO ORIGINAL COMENTADO:
    if (!videoId) return;
    
    setVideoProgresses(prev => {
      const currentProgress = prev[videoId] || 0;
      if (progress <= currentProgress) return prev;
      
      const newProgresses = { ...prev, [videoId]: progress };
      
      let totalProgress = 0;
      let videoCount = 0;
      
      if (videos && videos.length > 0) {
        videoCount = videos.length;
        videos.forEach(video => {
          const videoProgress = newProgresses[video.id] || 0;
          totalProgress += videoProgress;
        });
        
        const averageProgress = Math.round(totalProgress / videoCount);
        
        updateProgressMutation.mutate({
          progress: averageProgress,
          videoProgress: newProgresses
        });
      }
      
      return newProgresses;
    });
    */
  };
  
  // ❌ DESABILITADO: Função que atualizava progresso baseado em tempo de vídeo
  const handleVideoTimeUpdate = (currentTime: number, duration: number) => {
    // NÃO FAZ NADA - sistema progressivo desabilitado
    console.log('[AULA-VIEW] ⚠️ handleVideoTimeUpdate desabilitado (sistema progressivo)');
    return;
    
    /* CÓDIGO ORIGINAL COMENTADO:
    if (!selectedVideo || !duration) return;
    const progress = Math.round((currentTime / duration) * 100);
    handleVideoProgress(selectedVideo.id, progress);
    */
  };
  
  // ✅ Marcar aula como concluída usando sistema binário
  const handleComplete = async (): Promise<boolean> => {
    console.log('[AULA-VIEW] 🎯 handleComplete chamado');
    
    if (isCompleted) {
      console.log('[AULA-VIEW] ℹ️ Aula já concluída');
      return true;
    }
    
    try {
      const success = await completeLesson();
      
      if (success) {
        console.log('[AULA-VIEW] ✅ Progresso salvo! Abrindo modal NPS');
        setCompletionDialogOpen(true);
      } else {
        console.error('[AULA-VIEW] ❌ Falha ao salvar progresso');
        toast.error("Não foi possível marcar como concluída");
      }
      
      return success;
    } catch (error) {
      console.error('[AULA-VIEW] ❌ Erro ao completar:', error);
      toast.error("Erro ao marcar aula como concluída");
      return false;
    }
  };
  
  // Selecionar um vídeo para exibir
  const handleVideoSelect = (video: any) => {
    setSelectedVideo(video);
  };
  
  // Obter o último tempo assistido para o vídeo selecionado
  const getLastPosition = () => {
    if (selectedVideo && userProgress?.last_position_seconds) {
      return userProgress.last_position_seconds;
    }
    return 0;
  };
  
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
        <p className="text-muted-foreground mt-2 mb-4">A aula que você está procurando não existe ou foi removida.</p>
        <Button onClick={() => navigate(`/formacao/cursos/${cursoId}`)}>Voltar para o curso</Button>
      </div>
    );
  }

  return (
    <div className="container py-6">
      {/* Componente invisível para atualizar durações automaticamente */}
      
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
            progress={userProgress?.progress_percentage || 0}
          />
          
          <div className="mt-8 space-y-6">
            {/* Player de vídeo */}
            <VideoPlayer 
              video={selectedVideo} 
              onTimeUpdate={handleVideoTimeUpdate}
              startTime={getLastPosition()}
            />
            
            {/* Removido o componente de exibição de duração */}
            
            {/* Lista de vídeos da aula */}
            {videos && videos.length > 1 && (
              <VideoDisplay 
                lessonId={aulaId || ''} 
                onVideoSelect={handleVideoSelect}
              />
            )}
            
            {/* Recursos da aula */}
            {recursos && recursos.length > 0 && (
              <LessonResources resources={recursos} />
            )}
            
            {/* Conteúdo da aula */}
            {aula.description && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Sobre esta aula</h3>
                <div className="prose max-w-none">
                  <p>{aula.description}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Navegação movida para o final da página */}
          <div className="mt-8">
            <LessonNavigation
              courseId={cursoId!}
              currentLesson={aula}
              allLessons={moduloData?.aulas || []}
              onComplete={handleComplete}
              isCompleted={isCompleted}
            />
          </div>
        </div>
        
        {/* Modal de conclusão com NPS */}
        <LessonCompletionModal
          isOpen={completionDialogOpen}
          setIsOpen={setCompletionDialogOpen}
          lesson={aula}
          onNext={() => {
            setCompletionDialogOpen(false);
            // Navegar para próxima aula se existir
            const currentIndex = moduloData?.aulas?.findIndex(l => l.id === aula.id) ?? -1;
            const nextLesson = currentIndex >= 0 ? moduloData?.aulas?.[currentIndex + 1] : null;
            if (nextLesson) {
              navigate(`/formacao/aulas/${nextLesson.id}`);
            }
          }}
          nextLesson={
            moduloData?.aulas?.[
              (moduloData?.aulas?.findIndex(l => l.id === aula.id) ?? -1) + 1
            ]
          }
        />

        
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
