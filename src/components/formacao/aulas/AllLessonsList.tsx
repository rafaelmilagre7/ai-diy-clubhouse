import { useState, useMemo } from "react";
import { LearningLessonWithRelations } from "@/lib/supabase/types/extended";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, FileText, Loader2, Eye, Search, BookOpen, Layers } from "lucide-react";
import { AulaDeleteDialog } from "./AulaDeleteDialog";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PublishLessonButton } from "./PublishLessonButton";

interface AllLessonsListProps {
  lessons: LearningLessonWithRelations[];
  loading: boolean;
  onEdit: (aula: LearningLessonWithRelations) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  onRefresh?: () => void;
}

interface GroupedLessons {
  [courseTitle: string]: {
    [moduleTitle: string]: LearningLessonWithRelations[];
  };
}

export const AllLessonsList = ({ 
  lessons, 
  loading, 
  onEdit, 
  onDelete, 
  isAdmin, 
  onRefresh 
}: AllLessonsListProps) => {
  const [aulaParaExcluir, setAulaParaExcluir] = useState<LearningLessonWithRelations | null>(null);
  const [publishingStates, setPublishingStates] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  console.log("AllLessonsList: Recebendo props:", { 
    lessonsCount: lessons?.length || 0, 
    loading, 
    isAdmin,
    sampleLessons: lessons?.slice(0, 2)
  });

  // Filtrar e agrupar aulas
  const { filteredLessons, groupedLessons, courses } = useMemo(() => {
    let filtered = lessons.filter(lesson => {
      const matchesSearch = !searchTerm || 
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lesson.module as any)?.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCourse = selectedCourse === "all" || 
        (lesson.module as any)?.course_title === selectedCourse;
      
      const isPublished = lesson.id in publishingStates 
        ? publishingStates[lesson.id] 
        : !!lesson.published;
      
      const matchesStatus = selectedStatus === "all" || 
        (selectedStatus === "published" && isPublished) ||
        (selectedStatus === "draft" && !isPublished);
      
      return matchesSearch && matchesCourse && matchesStatus;
    });

    // Agrupar por curso e módulo
    const grouped: GroupedLessons = {};
    const coursesSet = new Set<string>();

    filtered.forEach(lesson => {
      const courseTitle = (lesson.module as any)?.course_title || "Curso sem nome";
      const moduleTitle = (lesson.module as any)?.title || "Módulo sem nome";
      
      coursesSet.add(courseTitle);

      if (!grouped[courseTitle]) {
        grouped[courseTitle] = {};
      }
      if (!grouped[courseTitle][moduleTitle]) {
        grouped[courseTitle][moduleTitle] = [];
      }
      grouped[courseTitle][moduleTitle].push(lesson);
    });

    return {
      filteredLessons: filtered,
      groupedLessons: grouped,
      courses: Array.from(coursesSet).sort()
    };
  }, [lessons, searchTerm, selectedCourse, selectedStatus, publishingStates]);

  // Abrir diálogo de confirmação para excluir
  const handleOpenDelete = (aula: LearningLessonWithRelations) => {
    setAulaParaExcluir(aula);
  };

  // Confirmar exclusão
  const handleConfirmDelete = () => {
    if (aulaParaExcluir) {
      onDelete(aulaParaExcluir.id);
      setAulaParaExcluir(null);
      if (onRefresh) {
        onRefresh();
      }
    }
  };

  // Atualizar estado de publicação local
  const handlePublishChange = (aulaId: string, published: boolean) => {
    setPublishingStates(prevState => ({
      ...prevState,
      [aulaId]: published
    }));
    
    if (onRefresh) {
      onRefresh();
    }
  };

  // Determinar se uma aula está publicada
  const isPublished = (aula: LearningLessonWithRelations) => {
    return aula.id in publishingStates 
      ? publishingStates[aula.id] 
      : !!aula.published;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Filtros */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar aulas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cursos</SelectItem>
            {courses.map(course => (
              <SelectItem key={course} value={course}>{course}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="published">Publicadas</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-primary mr-4" />
            <div>
              <p className="text-2xl font-bold">{filteredLessons.length}</p>
              <p className="text-xs text-muted-foreground">Total de Aulas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <BookOpen className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {filteredLessons.filter(lesson => isPublished(lesson)).length}
              </p>
              <p className="text-xs text-muted-foreground">Publicadas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Layers className="h-8 w-8 text-orange-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{courses.length}</p>
              <p className="text-xs text-muted-foreground">Cursos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista agrupada */}
      {Object.keys(groupedLessons).length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-background">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma aula encontrada</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            Tente ajustar os filtros ou criar uma nova aula.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedLessons).map(([courseTitle, modules]) => (
            <div key={courseTitle} className="space-y-4">
              <h2 className="text-xl font-bold text-primary border-b pb-2">
                {courseTitle}
              </h2>
              
              {Object.entries(modules).map(([moduleTitle, moduleLessons]) => (
                <div key={moduleTitle} className="space-y-4">
                  <h3 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    {moduleTitle} 
                    <Badge variant="outline">{moduleLessons.length} aulas</Badge>
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ml-4">
                    {moduleLessons.map((aula) => (
                      <Card key={aula.id} className="overflow-hidden">
                        {aula.cover_image_url ? (
                          <div className="aspect-video w-full overflow-hidden">
                            <img 
                              src={aula.cover_image_url} 
                              alt={aula.title} 
                              className="h-full w-full object-cover transition-all hover:scale-105" 
                            />
                          </div>
                        ) : (
                          <div className="aspect-video w-full bg-muted flex items-center justify-center">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="line-clamp-2 text-sm">{aula.title}</CardTitle>
                            <Badge variant={isPublished(aula) ? "default" : "outline"} className="text-xs">
                              {isPublished(aula) ? "Publicada" : "Rascunho"}
                            </Badge>
                          </div>
                          {aula.description && (
                            <p className="text-muted-foreground text-xs line-clamp-2">
                              {aula.description}
                            </p>
                          )}
                        </CardHeader>

                        <CardContent>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <p>{format(new Date(aula.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                            {aula.estimated_time_minutes && aula.estimated_time_minutes > 0 && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {aula.estimated_time_minutes} min
                              </Badge>
                            )}
                          </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-2">
                          <div className="flex justify-between w-full">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/formacao/aulas/${aula.id}`}>
                                <Eye className="h-3 w-3 mr-1" />
                                Ver
                              </Link>
                            </Button>
                            
                            {isAdmin && (
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm" onClick={() => onEdit(aula)}>
                                  <Pencil className="h-3 w-3 mr-1" />
                                  Editar
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleOpenDelete(aula)}>
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Excluir
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          {isAdmin && (
                            <div className="w-full">
                              <PublishLessonButton 
                                lessonId={aula.id}
                                isPublished={isPublished(aula)}
                                onPublishChange={(published) => handlePublishChange(aula.id, published)}
                                showPreview={false}
                              />
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      
      <AulaDeleteDialog 
        open={!!aulaParaExcluir} 
        onOpenChange={() => setAulaParaExcluir(null)}
        onConfirm={handleConfirmDelete}
        aula={aulaParaExcluir}
      />
    </>
  );
};