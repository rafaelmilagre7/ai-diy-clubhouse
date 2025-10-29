import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, RefreshCw, CheckCircle, AlertCircle, Video, ChevronDown, ChevronUp, GraduationCap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showModernError, showModernSuccess, showModernInfo } from '@/lib/toast-helpers';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { AccessBlocked } from "@/components/ui/access-blocked";

interface CourseDuration {
  id: string;
  course_id: string;
  total_duration_seconds: number;
  total_videos: number;
  synced_videos: number;
  calculated_hours: string;
  sync_status: 'pending' | 'syncing' | 'completed' | 'failed';
  last_sync_at: string;
  learning_courses: {
    id: string;
    title: string;
  };
}

export const CourseDurationManager = () => {
  const [syncingCourses, setSyncingCourses] = useState<Set<string>>(new Set());
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const { data: courseDurations, isLoading } = useQuery({
    queryKey: ['course-durations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_durations')
        .select(`
          *,
          learning_courses!inner(
            id,
            title
          )
        `)
        .order('learning_courses.title');

      if (error) throw error;
      return data as CourseDuration[];
    }
  });

  const syncCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data, error } = await supabase.functions.invoke('calculate-course-durations', {
        body: { courseId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, courseId) => {
      setSyncingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ['course-durations'] });
      showModernSuccess('Sincronização concluída!', `Duração calculada: ${data.calculatedHours}`);
    },
    onError: (error: any, courseId) => {
      setSyncingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
      showModernError('Erro na sincronização', error.message);
    }
  });

  const handleSyncCourse = async (courseId: string) => {
    setSyncingCourses(prev => new Set(prev).add(courseId));
    syncCourseMutation.mutate(courseId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'syncing':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted/50 text-muted-foreground border-muted/20';
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}min`;
  };

  if (isLoading) {
    return (
      <div className="space-y-md">
        <div className="flex items-center gap-sm">
          <Loader2 className="h-8 w-8 animate-spin text-aurora" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      <div className="flex items-center gap-sm mb-md">
        <Video className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Gerenciar Durações dos Cursos</h2>
      </div>

      <div className="grid gap-md">
        {courseDurations?.map((course) => {
          const progress = course.total_videos > 0 
            ? (course.synced_videos / course.total_videos) * 100 
            : 0;
          
          return (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
                  <div className="flex items-center gap-md">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-aurora to-aurora-primary flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>{course.learning_courses.title}</CardTitle>
                      <CardDescription className="flex items-center gap-sm mt-xs">
                        <Clock className="h-4 w-4" />
                        {formatDuration(course.total_duration_seconds)}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <Button
                    variant={expandedCourses.has(course.id) ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newExpanded = new Set(expandedCourses);
                      if (expandedCourses.has(course.id)) {
                        newExpanded.delete(course.id);
                      } else {
                        newExpanded.add(course.id);
                      }
                      setExpandedCourses(newExpanded);
                    }}
                  >
                    {expandedCourses.has(course.id) ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-sm" />
                        Ocultar módulos
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-sm" />
                        Ver módulos
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              {expandedCourses.has(course.id) && (
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-md">
                    <div className="text-center p-sm bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground">Total de Vídeos</div>
                      <div className="text-lg font-semibold">{course.total_videos}</div>
                    </div>
                    <div className="text-center p-sm bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground">Sincronizados</div>
                      <div className="text-lg font-semibold text-success">{course.synced_videos}</div>
                    </div>
                    <div className="text-center p-sm bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground">Duração Total</div>
                      <div className="text-lg font-semibold text-primary">{course.calculated_hours}</div>
                    </div>
                    <div className="text-center p-sm bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground">Última Sync</div>
                      <div className="text-sm">
                        {new Date(course.last_sync_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  {course.total_videos > 0 && (
                    <div className="space-y-sm">
                      <div className="flex justify-between text-sm">
                        <span>Progresso de Sincronização</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {courseDurations?.length === 0 && (
        <Card>
          <CardContent className="text-center py-xl">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-md" />
            <p className="text-muted-foreground">Nenhum curso encontrado para sincronização.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};