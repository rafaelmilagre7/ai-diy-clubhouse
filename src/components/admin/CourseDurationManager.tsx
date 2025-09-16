import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, RefreshCw, CheckCircle, AlertCircle, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

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
      toast.success(`Sincronização concluída: ${data.calculatedHours}`);
    },
    onError: (error: any, courseId) => {
      setSyncingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
      toast.error(`Erro na sincronização: ${error.message}`);
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Video className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Gerenciar Durações dos Cursos</h2>
      </div>

      <div className="grid gap-4">
        {courseDurations?.map((course) => {
          const isSyncing = syncingCourses.has(course.course_id);
          const progress = course.total_videos > 0 ? (course.synced_videos / course.total_videos) * 100 : 0;

          return (
            <Card key={course.id} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{course.learning_courses.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      {getStatusIcon(isSyncing ? 'syncing' : course.sync_status)}
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(isSyncing ? 'syncing' : course.sync_status)}
                      >
                        {isSyncing ? 'Sincronizando...' : course.sync_status}
                      </Badge>
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleSyncCourse(course.course_id)}
                    disabled={isSyncing}
                    size="sm"
                    variant="outline"
                  >
                    {isSyncing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Sincronizar
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total de Vídeos</div>
                    <div className="text-lg font-semibold">{course.total_videos}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">Sincronizados</div>
                    <div className="text-lg font-semibold text-success">{course.synced_videos}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">Duração Total</div>
                    <div className="text-lg font-semibold text-primary">{course.calculated_hours}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">Última Sync</div>
                    <div className="text-sm">
                      {new Date(course.last_sync_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                {course.total_videos > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso de Sincronização</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {courseDurations?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum curso encontrado para sincronização.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};