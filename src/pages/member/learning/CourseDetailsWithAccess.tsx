
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CourseDetailsSkeleton } from "@/components/learning/member/CourseDetailsSkeleton";
import { CourseModules } from "@/components/learning/member/CourseModules";
import { CourseHeader } from "@/components/learning/member/CourseHeader";
import { CourseProgress } from "@/components/learning/member/CourseProgress";
import { AccessDeniedPage } from "@/components/learning/member/AccessDeniedPage";
import { PaymentRequired } from "@/components/payments/PaymentRequired";
import { AccessPerformanceWrapper } from "@/components/learning/performance/AccessPerformanceWrapper";
import { ArrowLeft } from "lucide-react";
import { useCourseDetailsWithAccess } from "@/hooks/learning/useCourseDetailsWithAccess";
import { useCourseStats } from "@/hooks/learning/useCourseStats";
import { usePaymentAccess } from "@/hooks/payments/usePaymentAccess";
import { useAdvancedRules } from "@/hooks/learning/useAdvancedRules";
import { useAccessCacheOptimized } from "@/hooks/learning/useAccessCacheOptimized";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { useEffect } from "react";

const CourseDetailsWithAccess = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Hooks principais
  const { 
    course, 
    modules, 
    allLessons, 
    userProgress, 
    hasAccess,
    requiredRoles,
    isLoading, 
    accessDenied 
  } = useCourseDetailsWithAccess(id);
  
  const { courseStats, firstLessonId, courseProgress } = useCourseStats({ 
    modules, 
    allLessons, 
    userProgress 
  });

  // Hooks avançados da Fase 3
  const { paymentStatus, canAccessPremiumCourse } = usePaymentAccess();
  const { checkAdvancedAccess } = useAdvancedRules();
  const { get: getCached, set: setCached } = useAccessCacheOptimized();
  const { createAccessDeniedNotification } = useNotifications();

  // Cache e verificações avançadas
  useEffect(() => {
    if (course && id) {
      // Cache dos dados do curso
      setCached(`course_${id}`, course);
      
      // Verificar regras avançadas se o acesso básico foi negado
      if (accessDenied) {
        checkAdvancedAccess(id).then(advancedAccess => {
          if (!advancedAccess) {
            // Criar notificação de acesso negado
            createAccessDeniedNotification(
              course.title, 
              `Você não tem permissão para acessar este curso. Roles necessários: ${requiredRoles.join(', ')}`
            );
          }
        });
      }
    }
  }, [course, id, accessDenied, setCached, checkAdvancedAccess, createAccessDeniedNotification, requiredRoles]);

  // Verificar se é um curso premium que requer pagamento
  const isPremiumCourse = course?.title?.includes('Premium') || course?.title?.includes('Avançado');
  const requiresPayment = isPremiumCourse && !canAccessPremiumCourse('premium');

  // Se está carregando, mostrar skeleton com performance wrapper
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
        
        <AccessPerformanceWrapper isLoading={true}>
          <CourseDetailsSkeleton />
        </AccessPerformanceWrapper>
      </div>
    );
  }

  // Se não foi encontrado o curso
  if (!course) {
    navigate("/learning");
    return null;
  }

  // Se requer pagamento, mostrar componente de upgrade
  if (requiresPayment) {
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
        
        <PaymentRequired 
          courseTitle={course.title}
          requiredTier="premium"
          className="max-w-2xl mx-auto"
        />
      </div>
    );
  }

  // Se o acesso foi negado, mostrar página específica
  if (accessDenied) {
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
        
        <AccessDeniedPage 
          courseTitle={course.title}
          requiredRoles={requiredRoles}
        />
      </div>
    );
  }

  // Se tem acesso, mostrar conteúdo normal
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
      
      <AccessPerformanceWrapper isLoading={false}>
        <CourseHeader 
          title={course.title} 
          description={course.description} 
          coverImage={course.cover_image_url}
          stats={courseStats}
          firstLessonId={firstLessonId}
          courseId={id!}
        />
        
        <div className="mt-6">
          <CourseProgress 
            percentage={courseProgress} 
            className="mb-6"
          />
          
          <CourseModules 
            modules={modules || []} 
            courseId={id!} 
            userProgress={userProgress || []}
            course={course}
            expandedModules={[modules?.[0]?.id].filter(Boolean)}
          />
        </div>
      </AccessPerformanceWrapper>
    </div>
  );
};

export default CourseDetailsWithAccess;
