
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePremiumUpgradeModal } from "@/hooks/usePremiumUpgradeModal";
import { AuroraUpgradeModal } from "@/components/ui/aurora-upgrade-modal";

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { modalState, hideUpgradeModal } = usePremiumUpgradeModal();
  
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
        <div className="absolute inset-0 bg-gradient-to-br from-viverblue/8 via-transparent to-aurora/12" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-aurora/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-viverblue/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
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
