
import React from "react";
import { CourseCarousel } from "./CourseCarousel";
import { LearningCourse } from "@/lib/supabase";
import { AlertCircle, BookOpen, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MemberCoursesListProps {
  courses: LearningCourse[];
  userProgress?: any[];
  isLoading?: boolean;
  error?: any;
}

export const MemberCoursesList: React.FC<MemberCoursesListProps> = ({
  courses = [],
  userProgress = [],
  isLoading = false,
  error
}) => {
  console.log('[COURSES-LIST] Renderizando com:', {
    coursesCount: courses?.length || 0,
    isLoading,
    hasError: !!error,
    errorMessage: error?.message
  });

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-medium mb-2">Carregando cursos...</h3>
          <p className="text-muted-foreground">Buscando os melhores cursos para você</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    console.error('[COURSES-LIST] Erro nos cursos:', error);
    return (
      <Alert className="my-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          <strong>Erro ao carregar cursos:</strong><br />
          {error.message || 'Erro desconhecido. Tente recarregar a página.'}
          <br />
          <small className="text-muted-foreground mt-2 block">
            Se o problema persistir, entre em contato com o suporte.
          </small>
        </AlertDescription>
      </Alert>
    );
  }

  // Estado sem cursos
  if (!courses || courses.length === 0) {
    console.warn('[COURSES-LIST] Nenhum curso disponível');
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-xl font-semibold mb-2">Nenhum curso encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Não conseguimos encontrar cursos disponíveis no momento.
        </p>
        <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
          <p><strong>Possíveis causas:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Os cursos estão sendo configurados pelos administradores</li>
            <li>Problema temporário de conexão</li>
            <li>Você não tem permissão para acessar os cursos disponíveis</li>
          </ul>
          <p className="mt-3">
            <strong>Tente:</strong> Recarregar a página ou entrar em contato com o suporte.
          </p>
        </div>
      </div>
    );
  }

  // Para futuras categorizações por dificuldade, precisaríamos analisar as aulas de cada curso
  // ou adicionar difficulty_level na tabela learning_courses
  const allCourses = courses;

  console.log('[COURSES-LIST] Cursos disponíveis:', {
    total: allCourses.length,
    titles: allCourses.map(c => c.title)
  });

  return (
    <div className="space-y-8">
      {/* Todos os cursos */}
      <CourseCarousel
        title="Todos os Cursos"
        courses={allCourses}
        userProgress={userProgress}
        showEmptyMessage={false}
      />

      {/* Categorização por dificuldade removida temporariamente - 
          não existe difficulty_level na tabela learning_courses */}

      {/* Info para debug (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && courses.length > 0 && (
        <div className="mt-8 p-4 bg-muted/30 rounded-lg border">
          <h4 className="font-medium mb-2">Debug Info (desenvolvimento)</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Total de cursos: {courses.length}</p>
            <p>• Progresso do usuário: {userProgress?.length || 0} registros</p>
            <p>• Cursos encontrados: {courses.map(c => c.title).join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );
};
