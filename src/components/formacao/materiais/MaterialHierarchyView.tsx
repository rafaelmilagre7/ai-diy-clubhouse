import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight,
  Download, 
  FileText, 
  FileImage, 
  FileArchive,
  FileCode, 
  File,
  BookOpen,
  FolderOpen,
  GraduationCap
} from "lucide-react";
import { RecursoWithDetails } from "./types";

interface MaterialHierarchyViewProps {
  recursos: RecursoWithDetails[];
  onEdit: (recurso: RecursoWithDetails) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

interface GroupedResources {
  [courseTitle: string]: {
    [moduleTitle: string]: {
      [lessonTitle: string]: RecursoWithDetails[];
    };
  };
}

export const MaterialHierarchyView = ({ 
  recursos, 
  onEdit, 
  onDelete, 
  isAdmin 
}: MaterialHierarchyViewProps) => {
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="h-4 w-4" />;
    
    if (fileType.includes("pdf")) return <FileText className="h-4 w-4 text-destructive" />;
    if (fileType.includes("image")) return <FileImage className="h-4 w-4 text-success" />;
    if (fileType.includes("zip") || fileType.includes("rar")) return <FileArchive className="h-4 w-4 text-warning" />;
    if (fileType.includes("doc")) return <FileText className="h-4 w-4 text-operational" />;
    if (fileType.includes("code") || fileType.includes("json")) return <FileCode className="h-4 w-4 text-strategy" />;
    
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (bytes === null) return "—";
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const handleDownload = (recurso: RecursoWithDetails) => {
    if (recurso.file_url) {
      window.open(recurso.file_url, '_blank');
    }
  };

  const toggleExpanded = (type: 'course' | 'module' | 'lesson', key: string) => {
    const setter = type === 'course' ? setExpandedCourses : 
                   type === 'module' ? setExpandedModules : setExpandedLessons;
    
    setter(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Agrupar recursos por hierarquia
  const groupedResources: GroupedResources = recursos.reduce((acc, recurso) => {
    const course = recurso.lesson?.module?.course;
    const module = recurso.lesson?.module;
    const lesson = recurso.lesson;

    const courseTitle = course?.title || "Sem curso";
    const moduleTitle = module?.title || "Sem módulo";
    const lessonTitle = lesson?.title || "Sem aula";

    if (!acc[courseTitle]) acc[courseTitle] = {};
    if (!acc[courseTitle][moduleTitle]) acc[courseTitle][moduleTitle] = {};
    if (!acc[courseTitle][moduleTitle][lessonTitle]) acc[courseTitle][moduleTitle][lessonTitle] = [];

    acc[courseTitle][moduleTitle][lessonTitle].push(recurso);
    return acc;
  }, {} as GroupedResources);

  if (recursos.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">Nenhum material encontrado</h3>
        <p className="text-muted-foreground">
          Tente ajustar os filtros ou adicione novos materiais.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedResources).map(([courseTitle, modules]) => {
        const courseKey = courseTitle;
        const isCourseExpanded = expandedCourses.has(courseKey);
        const courseResourceCount = Object.values(modules).flat()
          .map(lessons => Object.values(lessons).flat().length)
          .reduce((a, b) => a + b, 0);

        return (
          <Card key={courseKey} className="bg-gradient-to-r from-card/80 to-card/60 border-0 shadow-lg">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => toggleExpanded('course', courseKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {isCourseExpanded ? (
                        <ChevronDown className="h-5 w-5 text-primary" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-primary" />
                      )}
                      <GraduationCap className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{courseTitle}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {courseResourceCount} materiais em {Object.keys(modules).length} módulos
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {courseResourceCount}
                    </Badge>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 space-y-3">
                  {Object.entries(modules).map(([moduleTitle, lessons]) => {
                    const moduleKey = `${courseKey}-${moduleTitle}`;
                    const isModuleExpanded = expandedModules.has(moduleKey);
                    const moduleResourceCount = Object.values(lessons).flat().length;

                    return (
                      <Card key={moduleKey} className="bg-muted/20 border border-muted">
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <CardHeader 
                              className="py-3 cursor-pointer hover:bg-muted/40 transition-colors"
                              onClick={() => toggleExpanded('module', moduleKey)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {isModuleExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                  <FolderOpen className="h-5 w-5 text-warning" />
                                  <div>
                                    <h4 className="font-medium">{moduleTitle}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      {moduleResourceCount} materiais em {Object.keys(lessons).length} aulas
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {moduleResourceCount}
                                </Badge>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <CardContent className="pt-0 space-y-2">
                              {Object.entries(lessons).map(([lessonTitle, resources]) => {
                                const lessonKey = `${moduleKey}-${lessonTitle}`;
                                const isLessonExpanded = expandedLessons.has(lessonKey);

                                return (
                                  <Card key={lessonKey} className="bg-background/50 border border-muted/50">
                                    <Collapsible>
                                      <CollapsibleTrigger asChild>
                                        <CardHeader 
                                          className="py-2 cursor-pointer hover:bg-muted/20 transition-colors"
                                          onClick={() => toggleExpanded('lesson', lessonKey)}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                              {isLessonExpanded ? (
                                                <ChevronDown className="h-3 w-3" />
                                              ) : (
                                                <ChevronRight className="h-3 w-3" />
                                              )}
                                              <BookOpen className="h-4 w-4 text-operational" />
                                              <h5 className="text-sm font-medium">{lessonTitle}</h5>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                              {resources.length}
                                            </Badge>
                                          </div>
                                        </CardHeader>
                                      </CollapsibleTrigger>

                                      <CollapsibleContent>
                                        <CardContent className="pt-0 space-y-2">
                                          {resources.map((recurso) => (
                                            <div 
                                              key={recurso.id}
                                              className="flex items-center justify-between p-3 bg-card rounded-lg border hover:shadow-sm transition-shadow"
                                            >
                                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                {getFileIcon(recurso.file_type)}
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-sm font-medium truncate">
                                                    {recurso.name}
                                                  </p>
                                                  <p className="text-xs text-muted-foreground">
                                                    {formatFileSize(recurso.file_size_bytes)}
                                                  </p>
                                                </div>
                                              </div>

                                              <div className="flex items-center space-x-2">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => handleDownload(recurso)}
                                                  className="h-8"
                                                >
                                                  <Download className="h-3 w-3" />
                                                </Button>

                                                {isAdmin && (
                                                  <>
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => onEdit(recurso)}
                                                      className="h-8"
                                                    >
                                                      Editar
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => onDelete(recurso.id)}
                                                      className="h-8 text-status-error hover:bg-status-error/10"
                                                    >
                                                      Excluir
                                                    </Button>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </CardContent>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  </Card>
                                );
                              })}
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
};