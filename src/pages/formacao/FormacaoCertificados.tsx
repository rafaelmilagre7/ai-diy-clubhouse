import React, { useState } from "react";
import { useLearningCourses } from "@/hooks/learning/useLearningCourses";
import { useCertificateTemplates } from "@/hooks/learning/useCertificateTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Settings, Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SimplifiedCertificateForm } from "@/components/formacao/certificados/SimplifiedCertificateForm";
import { Badge } from "@/components/ui/badge";

const FormacaoCertificados = () => {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  const { courses = [], isLoading: coursesLoading, error: coursesError } = useLearningCourses();
  const {
    templates,
    isLoading: templatesLoading,
    error: templatesError,
    saveTemplate,
    isSaving
  } = useCertificateTemplates();

  const getCertificateConfig = (courseId: string) => {
    const template = templates.find(template => template.course_id === courseId);
    if (!template) return null;
    
    return {
      id: template.id,
      course_id: template.course_id || courseId,
      workload_hours: template.metadata?.workload_hours || "",
      course_description: template.metadata?.course_description || "",
      is_active: template.is_active
    };
  };

  const handleConfigureCourse = (course: any) => {
    setSelectedCourse(course);
    setOpenDialog(true);
  };

  const handleSave = (templateData: any) => {
    saveTemplate(templateData, {
      onSuccess: () => {
        setOpenDialog(false);
        setSelectedCourse(null);
      }
    });
  };

  if (coursesLoading || templatesLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (coursesError || templatesError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Ocorreu um erro ao carregar os dados. Por favor, tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Configuração de Certificados</h1>
        <p className="text-muted-foreground">
          Configure os dados específicos que aparecerão nos certificados de cada curso.
          O template visual permanece sempre o mesmo - você só precisa definir a carga horária e descrição.
        </p>
      </div>

      {courses.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhum curso encontrado</AlertTitle>
          <AlertDescription>
            Não há cursos cadastrados ainda. Crie alguns cursos primeiro para poder configurar seus certificados.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => {
            const config = getCertificateConfig(course.id);
            const hasConfig = !!config;
            const isActive = hasConfig && config.is_active;

            return (
              <Card key={course.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg leading-tight flex-1 mr-2">
                      {course.title}
                    </CardTitle>
                    <div className="flex flex-col gap-1">
                      {hasConfig ? (
                        <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                          {isActive ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                          {isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Não configurado
                        </Badge>
                      )}
                    </div>
                  </div>
                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {hasConfig ? (
                    <div className="space-y-3">
                      <div className="bg-muted/50 p-3 rounded-lg text-sm">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="font-medium">Carga horária:</span>
                            <span>{config.workload_hours || "Não definida"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Descrição:</span>
                            <span className="text-right text-xs max-w-32 truncate">
                              {config.course_description || course.title}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Este curso ainda não tem certificado configurado
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Configure para permitir emissão de certificados
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleConfigureCourse(course)}
                    className="w-full"
                    variant={hasConfig ? "outline" : "default"}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {hasConfig ? "Editar Configuração" : "Configurar Certificado"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Configurar Certificado</DialogTitle>
          </DialogHeader>
          
          {selectedCourse && (
            <SimplifiedCertificateForm
              courseId={selectedCourse.id}
              courseTitle={selectedCourse.title}
              config={getCertificateConfig(selectedCourse.id)}
              onSave={handleSave}
              isSaving={isSaving}
              onCancel={() => setOpenDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormacaoCertificados;