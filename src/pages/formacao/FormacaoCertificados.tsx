import React, { useState } from "react";
import { useCertificateTemplates } from "@/hooks/learning/useCertificateTemplates";
import { useLearningCourses } from "@/hooks/learning/useLearningCourses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Edit, Plus, Trash, Award, BookOpen, Clock } from "lucide-react";
import { CertificateTemplate } from "@/types/learningTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CertificateTemplateForm } from "@/components/formacao/certificados/CertificateTemplateForm";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FormacaoCertificados = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  
  const {
    templates,
    isLoading,
    error,
    saveTemplate,
    deleteTemplate,
    isSaving,
    isDeleting
  } = useCertificateTemplates();

  const { courses = [], isLoading: coursesLoading } = useLearningCourses();
  
  // Separar templates globais dos específicos de cursos
  const globalTemplates = templates.filter(t => !t.course_id);
  const courseTemplates = templates.filter(t => t.course_id);
  
  // Agrupar templates por curso
  const templatesByCourse = courseTemplates.reduce((acc, template) => {
    const courseId = template.course_id!;
    if (!acc[courseId]) {
      acc[courseId] = [];
    }
    acc[courseId].push(template);
    return acc;
  }, {} as Record<string, CertificateTemplate[]>);

  const handleEdit = (template: CertificateTemplate) => {
    setSelectedTemplate(template);
    setOpenDialog(true);
  };

  const handleCreate = (courseId?: string) => {
    setSelectedTemplate({
      id: '',
      name: '',
      description: '',
      html_template: '',
      css_styles: null,
      is_active: true,
      is_default: false,
      course_id: courseId || null,
      metadata: {
        workload_hours: '',
        course_description: ''
      },
      created_at: '',
      updated_at: ''
    } as CertificateTemplate);
    setOpenDialog(true);
  };

  const handleSave = async (template: Partial<CertificateTemplate>) => {
    try {
      await saveTemplate(template);
      setOpenDialog(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Erro ao salvar template:", error);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (confirm("Tem certeza que deseja excluir este template?")) {
      await deleteTemplate(templateId);
    }
  };

  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Curso não encontrado';
  };

  const getWorkloadHours = (template: CertificateTemplate) => {
    return template.metadata?.workload_hours || 'Não definido';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Erro ao carregar templates de certificados: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Gestão de Certificados
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure templates de certificados para seus cursos
          </p>
        </div>
        <Button onClick={() => handleCreate()} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Template Global
        </Button>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">Templates por Curso</TabsTrigger>
          <TabsTrigger value="global">Templates Globais</TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="space-y-6">
          {courses.length === 0 ? (
            <Alert>
              <BookOpen className="h-4 w-4" />
              <AlertTitle>Nenhum curso encontrado</AlertTitle>
              <AlertDescription>
                Crie cursos primeiro para poder configurar certificados específicos.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {courses.map((course) => {
                const courseTemplates = templatesByCourse[course.id] || [];
                return (
                  <Card key={course.id} className="w-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            {course.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {courseTemplates.length} template(s) configurado(s)
                          </p>
                        </div>
                        <Button 
                          onClick={() => handleCreate(course.id)}
                          variant="outline" 
                          size="sm"
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar Template
                        </Button>
                      </div>
                    </CardHeader>
                    
                    {courseTemplates.length > 0 && (
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          {courseTemplates.map((template) => (
                            <Card key={template.id} className="border-border/50">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium">{template.name}</h4>
                                    {template.description && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {template.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {template.is_default && (
                                      <Badge variant="secondary">Padrão</Badge>
                                    )}
                                    {template.is_active ? (
                                      <Badge variant="default">Ativo</Badge>
                                    ) : (
                                      <Badge variant="outline">Inativo</Badge>
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {getWorkloadHours(template)}
                                  </div>
                                </div>
                                {template.metadata?.course_description && (
                                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {template.metadata.course_description}
                                  </p>
                                )}
                              </CardContent>
                              <CardFooter className="pt-0 gap-2">
                                <Button
                                  onClick={() => handleEdit(template)}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Editar
                                </Button>
                                <Button
                                  onClick={() => handleDelete(template.id)}
                                  variant="outline"
                                  size="sm"
                                  disabled={isDeleting}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="global" className="space-y-6">
          {globalTemplates.length === 0 ? (
            <Alert>
              <Award className="h-4 w-4" />
              <AlertTitle>Nenhum template global encontrado</AlertTitle>
              <AlertDescription>
                Crie templates globais que podem ser usados para qualquer curso.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {globalTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {template.is_default && (
                          <Badge variant="secondary">Padrão</Badge>
                        )}
                        {template.is_active ? (
                          <Badge variant="default">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {getWorkloadHours(template)}
                      </div>
                    </div>
                    {template.metadata?.course_description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                        {template.metadata.course_description}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button
                      onClick={() => handleEdit(template)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete(template.id)}
                      variant="outline"
                      size="icon"
                      disabled={isDeleting}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate?.id ? "Editar Template" : "Novo Template"}
            </DialogTitle>
          </DialogHeader>
          
          <CertificateTemplateForm
            template={selectedTemplate}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormacaoCertificados;