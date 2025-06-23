
import React from "react";
import { CertificateCard } from "./CertificateCard";
import { SolutionCertificateCard } from "./SolutionCertificateCard";
import { useCertificates } from "@/hooks/learning/useCertificates";
import { useSolutionCertificates } from "@/hooks/learning/useSolutionCertificates";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Award } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CertificatesListProps {
  courseId?: string;
}

export const CertificatesList = ({ courseId }: CertificatesListProps) => {
  console.log('[CertificatesList] Renderizando com courseId:', courseId);
  
  const { 
    certificates: courseCertificates, 
    isLoading: isLoadingCourse, 
    error: courseError, 
    downloadCertificate: downloadCourseCertificate
  } = useCertificates(courseId);
  
  const {
    certificates: solutionCertificates,
    isLoading: isLoadingSolutions,
    downloadCertificate: downloadSolutionCertificate
  } = useSolutionCertificates();
  
  const isLoading = isLoadingCourse || isLoadingSolutions;
  const error = courseError;
  
  console.log('[CertificatesList] Estado atual:', {
    courseCertificatesCount: courseCertificates.length,
    solutionCertificatesCount: solutionCertificates.length,
    isLoading,
    hasError: !!error
  });
  
  if (isLoading) {
    console.log('[CertificatesList] Renderizando estado de loading');
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-40 w-full bg-gray-700" />
            <Skeleton className="h-6 w-3/4 bg-gray-700" />
            <Skeleton className="h-4 w-1/2 bg-gray-700" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 bg-gray-700" />
              <Skeleton className="h-9 w-24 bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    console.error('[CertificatesList] Erro encontrado:', error);
    return (
      <Alert variant="destructive" className="bg-red-900/20 border-red-700">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          Ocorreu um erro ao carregar seus certificados: {error.message}
          <br />
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm underline"
          >
            Tentar novamente
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  const totalCertificates = courseCertificates.length + solutionCertificates.length;
  
  console.log('[CertificatesList] Total de certificados:', totalCertificates);
  
  if (totalCertificates === 0) {
    return (
      <Alert className="bg-[#151823] border-neutral-700">
        <Award className="h-4 w-4 text-viverblue" />
        <AlertTitle className="text-white">Nenhum certificado encontrado</AlertTitle>
        <AlertDescription className="text-gray-300">
          {courseId 
            ? "Você ainda não possui certificado para este curso. Complete todas as aulas para receber seu certificado."
            : "Você ainda não possui nenhum certificado. Complete cursos e implemente soluções para receber certificados."}
        </AlertDescription>
      </Alert>
    );
  }

  // Se é para um curso específico, mostrar apenas certificados do curso
  if (courseId) {
    console.log('[CertificatesList] Renderizando certificados para curso específico');
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courseCertificates.map((certificate) => (
          <CertificateCard
            key={certificate.id}
            certificate={certificate}
            onDownload={downloadCourseCertificate}
          />
        ))}
      </div>
    );
  }

  // Para a página geral de certificados, mostrar ambos os tipos em abas
  console.log('[CertificatesList] Renderizando todos os certificados em abas');
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-[#151823] border-neutral-700">
        <TabsTrigger value="all" className="data-[state=active]:bg-viverblue data-[state=active]:text-white">
          Todos ({totalCertificates})
        </TabsTrigger>
        <TabsTrigger value="courses" className="data-[state=active]:bg-viverblue data-[state=active]:text-white">
          Cursos ({courseCertificates.length})
        </TabsTrigger>
        <TabsTrigger value="solutions" className="data-[state=active]:bg-viverblue data-[state=active]:text-white">
          Soluções ({solutionCertificates.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-6">
        <div className="space-y-8">
          {/* Certificados de Soluções */}
          {solutionCertificates.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Certificados de Implementação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {solutionCertificates.map((certificate) => (
                  <SolutionCertificateCard
                    key={certificate.id}
                    certificate={certificate}
                    onDownload={downloadSolutionCertificate}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Certificados de Cursos */}
          {courseCertificates.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Certificados de Cursos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courseCertificates.map((certificate) => (
                  <CertificateCard
                    key={certificate.id}
                    certificate={certificate}
                    onDownload={downloadCourseCertificate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="courses" className="mt-6">
        {courseCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courseCertificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                onDownload={downloadCourseCertificate}
              />
            ))}
          </div>
        ) : (
          <Alert className="bg-[#151823] border-neutral-700">
            <Award className="h-4 w-4 text-viverblue" />
            <AlertTitle className="text-white">Nenhum certificado de curso</AlertTitle>
            <AlertDescription className="text-gray-300">
              Complete cursos para receber certificados de conclusão.
            </AlertDescription>
          </Alert>
        )}
      </TabsContent>
      
      <TabsContent value="solutions" className="mt-6">
        {solutionCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {solutionCertificates.map((certificate) => (
              <SolutionCertificateCard
                key={certificate.id}
                certificate={certificate}
                onDownload={downloadSolutionCertificate}
              />
            ))}
          </div>
        ) : (
          <Alert className="bg-[#151823] border-neutral-700">
            <Award className="h-4 w-4 text-viverblue" />
            <AlertTitle className="text-white">Nenhum certificado de implementação</AlertTitle>
            <AlertDescription className="text-gray-300">
              Implemente soluções para receber certificados de implementação.
            </AlertDescription>
          </Alert>
        )}
      </TabsContent>
    </Tabs>
  );
};
