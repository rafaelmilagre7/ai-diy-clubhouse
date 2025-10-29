
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useLearningRedirect } from '@/hooks/learning/useLearningRedirect';
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CourseDetailsSkeleton } from "@/components/learning/member/CourseDetailsSkeleton";
import { CourseModules } from "@/components/learning/member/CourseModules";
import { CourseHeader } from "@/components/learning/member/CourseHeader";
import { CourseProgress } from "@/components/learning/member/CourseProgress";
import { CourseSearchBar } from "@/components/learning/member/CourseSearchBar";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useCourseDetails } from "@/hooks/learning/useCourseDetails";
import { useCourseStats } from "@/hooks/learning/useCourseStats";
import { useCourseSearch } from "@/hooks/learning/useCourseSearch";
import { useProgressSync } from "@/hooks/learning/useProgressSync";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePremiumUpgradeModal } from "@/hooks/usePremiumUpgradeModal";
import { AuroraUpgradeModal } from "@/components/ui/aurora-upgrade-modal";

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const { modalState, hideUpgradeModal } = usePremiumUpgradeModal();
  
  // Sistema de sincronização de progresso entre páginas
  useProgressSync();
  
  // Sistema de validação e redirecionamento automático
  useLearningRedirect({
    courseId: id,
    currentPath: location.pathname
  });
  
  // Validação UUID antes de fazer queries
  const isValidUUID = (uuid?: string): boolean => {
    if (!uuid || uuid === 'undefined' || uuid === 'null') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };
  
  // Redirecionar se courseId for inválido
  if (!isValidUUID(id)) {
    console.warn('⚠️ [COURSE-DETAILS] CourseId inválido detectado:', id);
    navigate('/learning', { replace: true });
    return null;
  }
  
  const { course, modules, allLessons, userProgress, isLoading, error } = useCourseDetails(id);
  const { courseStats, firstLessonId, courseProgress } = useCourseStats({ 
    modules, 
    allLessons, 
    userProgress 
  });

  // Hook de busca inteligente
  const { searchResults, totalResults, hasActiveFilter } = useCourseSearch({
    allLessons: allLessons || [],
    searchQuery
  });

  // Revalidar dados quando a página recebe foco (usuário volta da aula)
  useEffect(() => {
    const handleFocus = async () => {
      // Verificar se houve atualização de progresso
      const lastUpdate = sessionStorage.getItem('learning_progress_updated');
      
      if (lastUpdate) {
        console.log('[COURSE-DETAILS] 🔄 Detectada atualização de progresso, revalidando dados...');
        
        // Refetch de todas as queries relacionadas
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ["course-details", id] }),
          queryClient.refetchQueries({ queryKey: ["learning-user-progress"] })
        ]);
        
        // Limpar flag de atualização
        sessionStorage.removeItem('learning_progress_updated');
      }
    };

    // Executar ao montar e quando ganhar foco
    handleFocus();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [id, queryClient]);

  // Se ainda está carregando, mostrar skeleton
  if (isLoading) {
    return (
      <div className="container pt-6 pb-12">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/learning")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Cursos
        </Button>
        <CourseDetailsSkeleton />
      </div>
    );
  }

  // Se houve erro ou curso não encontrado
  if (error || !course) {
    return (
      <div className="container pt-6 pb-12">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/learning")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Cursos
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar curso</AlertTitle>
          <AlertDescription>
            {error?.message || "Não foi possível carregar os dados deste curso."}
            <br />
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Definir módulos expandidos (primeiro módulo)
  const expandedModules = modules && modules.length > 0 ? [modules[0].id] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Aurora Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-aurora-primary/8 via-transparent to-aurora/12" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-aurora/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-aurora-primary/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      <div className="relative z-10">
        {/* Header Navigation */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container py-4">
            <Button
              variant="ghost"
              className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
              onClick={() => navigate("/learning")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Cursos
            </Button>
          </div>
        </div>
        
        {/* Hero Section - Estilo Netflix */}
        <div className="relative">
          <CourseHeader 
            title={course.title} 
            description={course.description} 
            coverImage={course.cover_image_url}
            stats={courseStats}
            firstLessonId={firstLessonId}
            courseId={id}
          />
        </div>
        
        {/* Progress Section */}
        <div className="container py-6">
          <CourseProgress 
            percentage={courseProgress} 
            className="mb-8"
          />
        </div>
        
        {/* Modules Section */}
        <div className="container pb-12">
          {/* Barra de busca inteligente */}
          <CourseSearchBar 
            courseId={id || ""}
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
            resultsCount={totalResults}
            totalLessons={allLessons?.length || 0}
          />
          
          <CourseModules 
            modules={modules} 
            courseId={id} 
            userProgress={userProgress}
            course={course}
            expandedModules={expandedModules}
            filteredLessons={hasActiveFilter ? searchResults : undefined}
            searchQuery={searchQuery}
          />
        </div>
      </div>
      {/* Premium Upgrade Modal (padrão freemium para cursos) */}
      <AuroraUpgradeModal 
        open={modalState.open}
        onOpenChange={hideUpgradeModal}
        itemTitle={modalState.itemTitle}
        feature="learning"
      />
    </div>
  );
};

export default CourseDetails;
