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
import { ShareCertificateDropdown } from "@/components/learning/certificates/ShareCertificateDropdown";
import { useAuth } from "@/contexts/auth";

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
  Medal,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CertificatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { user } = useAuth();
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
  const courseCertificates = certificates.filter(c => c.type === 'course').length;
  const solutionCertificates = certificates.filter(c => c.type === 'solution').length;
  const stats = {
    totalCertificates: certificates.length,
    completedCourses: courses.filter(course => 
      certificates.some(cert => cert.type === 'course' && cert.course_id === course.id)
    ).length,
    totalCourses: courses.length,
    completionRate: courses.length > 0 ? Math.round((courses.filter(course => 
      certificates.some(cert => cert.type === 'course' && cert.course_id === course.id)
    ).length / courses.length) * 100) : 0,
    breakdown: { courseCertificates, solutionCertificates }
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
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Modern Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-viverblue/10 via-primary/8 to-secondary/5 border border-border backdrop-blur-sm mx-4 md:mx-6">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-r from-viverblue/5 via-primary/5 to-secondary/5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-viverblue/15 to-transparent rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-accent/10 to-transparent rounded-full blur-xl -translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative px-8 py-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 via-viverblue/15 to-accent/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/20">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-accent/60 to-accent/40 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
                Seus Certificados
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Seu portfólio de conquistas e competências. Cada certificado representa uma jornada de aprendizado e crescimento profissional.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 space-y-8">
        {/* Estatísticas Modernas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent backdrop-blur-sm hover:from-primary/8 hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/20">
                  <Medal className="h-6 w-6 text-primary" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{stats.totalCertificates}</div>
                  <div className="text-sm text-muted-foreground font-medium">Certificados (total)</div>
                  <div className="text-xs text-muted-foreground">Cursos {stats.breakdown.courseCertificates} • Soluções {stats.breakdown.solutionCertificates}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-viverblue/5 via-viverblue/3 to-transparent backdrop-blur-sm hover:from-viverblue/8 hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-viverblue/10 to-transparent opacity-50" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-viverblue/20 to-viverblue/10 backdrop-blur-sm border border-viverblue/20">
                  <CheckCircle className="h-6 w-6 text-viverblue" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-viverblue">{stats.completedCourses}</div>
                  <div className="text-sm text-muted-foreground font-medium">Cursos Concluídos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-accent/5 via-accent/3 to-transparent backdrop-blur-sm hover:from-accent/8 hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-50" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 backdrop-blur-sm border border-accent/20">
                  <Star className="h-6 w-6 text-accent" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-accent">{stats.completionRate}%</div>
                  <div className="text-sm text-muted-foreground font-medium">Taxa de Conclusão</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-secondary/5 via-secondary/3 to-transparent backdrop-blur-sm hover:from-secondary/8 hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent opacity-50" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 backdrop-blur-sm border border-secondary/20">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-secondary">{eligibleCourses.length}</div>
                  <div className="text-sm text-muted-foreground font-medium">Cursos elegíveis</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Modernos */}
        <Tabs defaultValue="certificates" className="w-full">
          <div className="relative mb-8">
            <TabsList className="grid w-full grid-cols-2 h-14 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-1">
              <TabsTrigger 
                value="certificates" 
                className="flex items-center gap-2 h-full rounded-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-viverblue/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
              >
                <Award className="h-4 w-4" />
                Meus Certificados ({stats.totalCertificates})
              </TabsTrigger>
              <TabsTrigger 
                value="eligible" 
                className="flex items-center gap-2 h-full rounded-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent/10 data-[state=active]:to-secondary/10 data-[state=active]:text-accent data-[state=active]:border data-[state=active]:border-accent/20"
              >
                <Trophy className="h-4 w-4" />
                Cursos Elegíveis ({eligibleCourses.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="certificates" className="space-y-6">
            {/* Busca Moderna */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar certificados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-card/50 backdrop-blur-sm border-border/50 rounded-xl"
                />
              </div>
              <Button variant="outline" size="sm" className="h-12 px-6 bg-card/50 backdrop-blur-sm border-border/50 rounded-xl hover:bg-primary/10 hover:border-primary/20">
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
                  <Card key={certificate.id} className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-sm hover:from-card/90 hover:via-card/70 hover:to-card/50 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-viverblue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <CardHeader className="relative pb-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="mb-2 bg-primary/15 text-foreground border border-primary/30">
                          <Award className="h-3 w-3 mr-1" />
                          Certificado
                        </Badge>
                        <div className="flex items-center gap-2">
                          <ShareCertificateDropdown 
                            certificate={{ id: certificate.id, validation_code: certificate.validation_code, solutions: { title: certificate.title } }} 
                            userProfile={{ name: user?.user_metadata?.full_name || user?.email || "Usuário" }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(certificate)}
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                          >
                            <Award className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {certificate.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {certificate.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="relative space-y-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        Emitido em {format(new Date(certificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>

                      <div className="bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm p-3 rounded-lg border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Código de Validação</p>
                        <p className="font-mono text-sm font-semibold text-primary">{certificate.validation_code}</p>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(certificate)}
                          className="flex-1 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:border-primary/20 hover:text-primary"
                        >
                          <Award className="h-4 w-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(certificate.id)}
                          className="flex-1 bg-gradient-to-r from-primary to-viverblue hover:from-primary/90 hover:to-viverblue/90 shadow-lg hover:shadow-primary/20"
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
                    userName: user?.user_metadata?.full_name || user?.email || "Usuário",
                    solutionTitle: selectedCertificate.title,
                    solutionCategory: selectedCertificate.type === 'solution' ? 'Solução de IA' : 'Curso',
                    implementationDate: format(new Date(selectedCertificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
                    certificateId: selectedCertificate.id,
                    validationCode: selectedCertificate.validation_code
                  }}
                  headerTitle={`Certificado de ${selectedCertificate.type === 'solution' ? 'Implementação' : 'Conclusão'}`}
                  headerDescription={`Parabéns! Você conquistou este certificado ao ${selectedCertificate.type === 'solution' ? 'implementar a solução' : 'concluir o curso'} "${selectedCertificate.title}".`}
                  scale={0.6}
                  showHeader={false}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}