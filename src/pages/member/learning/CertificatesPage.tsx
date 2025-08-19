import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useLearningCourses } from "@/hooks/learning/useLearningCourses";
import { useUnifiedCertificates } from "@/hooks/learning/useUnifiedCertificates";
import { useUserProgress } from "@/hooks/learning/useUserProgress";
import { useDynamicSEO } from "@/hooks/seo/useDynamicSEO";
import { UnifiedCertificateViewer } from "@/components/certificates/UnifiedCertificateViewer";
import { CertificateEligibility } from "@/components/learning/certificates/CertificateEligibility";

import { 
  Award, 
  Download, 
  Share2, 
  Search, 
  Calendar, 
  CheckCircle, 
  Clock,
  Filter,
  Trophy,
  Star,
  Medal
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CertificatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { courses } = useLearningCourses();
  const { certificates, downloadCertificate, isLoading } = useUnifiedCertificates();
  const { userProgress } = useUserProgress();

  // SEO otimizado
  useDynamicSEO({
    title: 'Meus Certificados - Viver de IA',
    description: 'Visualize, baixe e compartilhe seus certificados de conclusão dos cursos de Inteligência Artificial.',
    keywords: 'certificados IA, certificados cursos, conclusão cursos, validação aprendizado'
  });

  // Calcular estatísticas
  const stats = {
    totalCertificates: certificates.length,
    completedCourses: courses.filter(course => 
      certificates.some(cert => cert.course_id === course.id)
    ).length,
    totalCourses: courses.length,
    completionRate: courses.length > 0 ? Math.round((certificates.length / courses.length) * 100) : 0
  };

  // Filtrar certificados
  const filteredCertificates = certificates.filter(cert =>
    cert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.validation_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cursos elegíveis para certificado
  const eligibleCourses = courses.filter(course => {
    const hasCertificate = certificates.some(cert => cert.course_id === course.id);
    if (hasCertificate) return false;

    // Verificar se completou o curso
    const courseProgress = userProgress.filter(p => 
      p.lesson && p.lesson.module && p.lesson.module.course_id === course.id
    );
    
    if (courseProgress.length === 0) return false;
    
    const completedLessons = courseProgress.filter(p => p.completed_at).length;
    return completedLessons === courseProgress.length && courseProgress.length > 0;
  });

  const handlePreview = (certificate: any) => {
    setSelectedCertificate(certificate);
    setPreviewOpen(true);
  };

  const handleDownload = async (certificateId: string) => {
    await downloadCertificate(certificateId);
  };

  return (
    <div className="container mx-auto py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Meus Certificados</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Visualize e gerencie seus certificados de conclusão dos cursos de IA. 
          Baixe, compartilhe e valide suas conquistas.
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Medal className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCertificates}</p>
                <p className="text-sm text-muted-foreground">Certificados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completedCourses}</p>
                <p className="text-sm text-muted-foreground">Cursos Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{eligibleCourses.length}</p>
                <p className="text-sm text-muted-foreground">Elegíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="certificates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Meus Certificados ({stats.totalCertificates})
          </TabsTrigger>
          <TabsTrigger value="eligible" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Cursos Elegíveis ({eligibleCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="space-y-6">
          {/* Busca */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar certificados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Lista de Certificados */}
          {filteredCertificates.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {certificates.length === 0 ? "Nenhum certificado ainda" : "Nenhum certificado encontrado"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {certificates.length === 0 
                    ? "Complete seus primeiros cursos para gerar certificados"
                    : "Tente ajustar sua busca ou filtros"
                  }
                </p>
                {certificates.length === 0 && (
                  <Button>
                    Explorar Cursos
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates.map((certificate) => (
                <Card key={certificate.id} className="hover-scale overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="mb-2">
                        <Award className="h-3 w-3 mr-1" />
                        Certificado
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(certificate)}
                          className="h-8 w-8 p-0"
                        >
                          <Award className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {certificate.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {certificate.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      Emitido em {format(new Date(certificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Código de Validação</p>
                      <p className="font-mono text-sm font-semibold">{certificate.validation_code}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(certificate)}
                        className="flex-1"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(certificate.id)}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="eligible" className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Cursos Elegíveis para Certificado</h3>
            <p className="text-muted-foreground">
              Complete estes cursos para gerar novos certificados
            </p>
          </div>

          {eligibleCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Parabéns!</h3>
                <p className="text-muted-foreground">
                  Você já possui certificados para todos os cursos concluídos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eligibleCourses.map((course) => {
                const courseProgress = userProgress.filter(p => 
                  p.lesson && p.lesson.module && p.lesson.module.course_id === course.id
                );
                const completedLessons = courseProgress.filter(p => p.completed_at).length;
                const progressPercentage = courseProgress.length > 0 ? Math.round((completedLessons / courseProgress.length) * 100) : 0;
                
                return (
                  <CertificateEligibility
                    key={course.id}
                    courseId={course.id}
                    progressPercentage={progressPercentage}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Preview do Certificado
            </DialogTitle>
            <DialogDescription>Visualize o certificado exatamente como será baixado em PDF.</DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <div className="p-4">
              <UnifiedCertificateViewer
                data={{
                  userName: "",
                  solutionTitle: selectedCertificate.title,
                  solutionCategory: selectedCertificate.type === 'solution' ? 'Solução de IA' : 'Curso',
                  implementationDate: format(new Date(selectedCertificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
                  certificateId: selectedCertificate.id,
                  validationCode: selectedCertificate.validation_code
                }}
                headerTitle={`Certificado de ${selectedCertificate.type === 'solution' ? 'Implementação' : 'Conclusão'}`}
                headerDescription={`Parabéns! Você conquistou este certificado ao ${selectedCertificate.type === 'solution' ? 'implementar a solução' : 'concluir o curso'} "${selectedCertificate.title}".`}
                scale={0.6}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}