
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, BookOpen, Film, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CourseModules } from '@/components/learning/member/CourseModules';
import { CourseCertificates } from '@/components/learning/member/CourseCertificates';
import { CourseProgress } from '@/components/learning/member/CourseProgress';
import { LearningCourse, LearningModule, LearningLesson } from '@/lib/supabase/types';

const CourseView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('modules');
  const [courseProgress, setCourseProgress] = useState(0);
  
  // Atualizar o título da página via document.title
  useEffect(() => {
    document.title = "Curso | Plataforma de Aprendizagem";
  }, []);
  
  // Buscar detalhes do curso
  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['learning-course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (error) throw error;
      
      // Atualizar o título com o nome do curso
      if (data?.title) {
        document.title = `${data.title} | Plataforma de Aprendizagem`;
      }
      
      return data as LearningCourse;
    }
  });
  
  // Buscar módulos do curso
  const { data: modules = [], isLoading: isLoadingModules } = useQuery({
    queryKey: ['learning-modules', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('course_id', courseId)
        .eq('published', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as LearningModule[];
    },
    enabled: !!courseId
  });
  
  // Buscar aulas do curso
  const { data: lessons = [], isLoading: isLoadingLessons } = useQuery({
    queryKey: ['learning-lessons', courseId],
    queryFn: async () => {
      if (!modules || modules.length === 0) return [];
      
      const moduleIds = modules.map(module => module.id);
      
      const { data, error } = await supabase
        .from('learning_lessons')
        .select('*')
        .in('module_id', moduleIds)
        .eq('published', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as LearningLesson[];
    },
    enabled: !!modules && modules.length > 0
  });
  
  // Buscar progresso do curso
  const { data: progress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['learning-course-progress', courseId],
    queryFn: async () => {
      if (!lessons || lessons.length === 0) return [];
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const lessonIds = lessons.map(lesson => lesson.id);
      
      const { data, error } = await supabase
        .from('learning_progress')
        .select('lesson_id, progress_percentage')
        .in('lesson_id', lessonIds)
        .eq('user_id', userData.user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!lessons && lessons.length > 0
  });
  
  // Calcular progresso geral do curso
  useEffect(() => {
    if (lessons && progress) {
      if (lessons.length === 0) {
        setCourseProgress(0);
        return;
      }
      
      // Criar mapa de progresso por aula
      const progressByLesson: Record<string, number> = {};
      progress.forEach(p => {
        progressByLesson[p.lesson_id] = p.progress_percentage;
      });
      
      // Calcular média de progresso
      let totalProgress = 0;
      lessons.forEach(lesson => {
        totalProgress += progressByLesson[lesson.id] || 0;
      });
      
      const avgProgress = Math.round(totalProgress / lessons.length);
      setCourseProgress(avgProgress);
    }
  }, [lessons, progress]);
  
  const isLoading = isLoadingCourse || isLoadingModules || isLoadingLessons || isLoadingProgress;
  
  // Coletar estatísticas do curso
  const totalModules = modules?.length || 0;
  const totalLessons = lessons?.length || 0;
  const totalMinutos = lessons?.reduce((acc, lesson) => acc + (lesson.estimated_time_minutes || 0), 0) || 0;
  
  if (isLoading) {
    return <div className="container py-8">Carregando curso...</div>;
  }
  
  if (!course) {
    return <div className="container py-8">Curso não encontrado</div>;
  }
  
  return (
    <div className="container py-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate("/learning")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para cursos
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            {course.description && (
              <p className="text-muted-foreground mt-2">{course.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>{totalModules} módulos</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Film className="h-4 w-4" />
                <span>{totalLessons} aulas</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{totalMinutos} minutos</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Atualizado em {format(new Date(course.updated_at), "dd/MM/yyyy", { locale: ptBR })}</span>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="modules">Conteúdo do Curso</TabsTrigger>
              <TabsTrigger value="certificates">Certificado</TabsTrigger>
            </TabsList>
            <TabsContent value="modules">
              <CourseModules 
                modules={modules} 
                courseId={courseId!}
                userProgress={[]}
                lessons={lessons}
                progress={progress || []}
              />
            </TabsContent>
            <TabsContent value="certificates">
              <CourseCertificates 
                course={course} 
                progressPercentage={courseProgress}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          {course.cover_image_url && (
            <div className="mb-6">
              <img 
                src={course.cover_image_url} 
                alt={course.title}
                className="w-full rounded-lg object-cover aspect-video" 
              />
            </div>
          )}
          
          <CourseProgress percentage={courseProgress} />
          
          <div className="mt-6">
            <Button className="w-full" size="lg">
              {courseProgress > 0 ? "Continuar Curso" : "Começar Curso"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
