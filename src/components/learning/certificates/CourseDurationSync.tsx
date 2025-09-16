import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, RefreshCw, CheckCircle, AlertCircle, Timer, Zap } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

export const CourseDurationSync = () => {
  const [syncingCourses, setSyncingCourses] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
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
    },
    enabled: isOpen
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
      queryClient.invalidateQueries({ queryKey: ['unified-certificates'] });
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

  const syncAllMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('calculate-course-durations', {
        body: { syncAll: true }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setSyncingCourses(new Set());
      queryClient.invalidateQueries({ queryKey: ['course-durations'] });
      queryClient.invalidateQueries({ queryKey: ['unified-certificates'] });
      toast.success("Sincronização completa de todos os cursos!");
    },
    onError: (error: any) => {
      setSyncingCourses(new Set());
      toast.error(`Erro na sincronização geral: ${error.message}`);
    }
  });

  const handleSyncCourse = async (courseId: string) => {
    setSyncingCourses(prev => new Set(prev).add(courseId));
    syncCourseMutation.mutate(courseId);
  };

  const handleSyncAll = async () => {
    if (courseDurations) {
      setSyncingCourses(new Set(courseDurations.map(c => c.course_id)));
    }
    syncAllMutation.mutate();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-success" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      case 'syncing':
        return <RefreshCw className="h-3 w-3 text-primary animate-spin" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-300 font-medium shadow-sm hover:shadow-md group"
          title="Sincronizar durações dos cursos para certificados mais precisos"
        >
          <Timer className="h-4 w-4 mr-2 group-hover:animate-pulse" />
          ⏱️ Sincronizar Durações
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-4 space-y-4" 
        align="end" 
        side="bottom"
        sideOffset={8}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Sincronizar Durações</h3>
          </div>
          
          <Button
            onClick={handleSyncAll}
            disabled={syncAllMutation.isPending || isLoading}
            size="sm"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium"
          >
            {syncAllMutation.isPending ? (
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Zap className="h-3 w-3 mr-1" />
            )}
            Sync Todos
          </Button>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
          💡 Sincronize as durações para gerar certificados com horários precisos
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {courseDurations?.map((course) => {
              const isSyncing = syncingCourses.has(course.course_id);
              const progress = course.total_videos > 0 ? (course.synced_videos / course.total_videos) * 100 : 0;

              return (
                <div key={course.id} className="p-3 bg-card border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{course.learning_courses.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(isSyncing ? 'syncing' : course.sync_status)}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(isSyncing ? 'syncing' : course.sync_status)}`}
                        >
                          {isSyncing ? 'Sincronizando...' : course.sync_status}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleSyncCourse(course.course_id)}
                      disabled={isSyncing}
                      size="sm"
                      variant="outline"
                      className="ml-2"
                    >
                      {isSyncing ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-1 bg-muted/20 rounded">
                      <div className="text-muted-foreground">Vídeos</div>
                      <div className="font-medium">{course.total_videos}</div>
                    </div>
                    <div className="text-center p-1 bg-muted/20 rounded">
                      <div className="text-muted-foreground">Sync</div>
                      <div className="font-medium text-success">{course.synced_videos}</div>
                    </div>
                    <div className="text-center p-1 bg-muted/20 rounded">
                      <div className="text-muted-foreground">Duração</div>
                      <div className="font-medium text-primary">{course.calculated_hours}</div>
                    </div>
                  </div>

                  {course.total_videos > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progresso</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {courseDurations?.length === 0 && !isLoading && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <Timer className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Nenhum curso encontrado para sincronização.
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};