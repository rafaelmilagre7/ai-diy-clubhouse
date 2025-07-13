
import React, { useMemo } from "react";
import { CertificateCard } from "./CertificateCard";
import { SolutionCertificateCard } from "./SolutionCertificateCard";
import { useCertificates } from "@/hooks/learning/useCertificates";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CertificatesListProps {
  courseId?: string;
  searchTerm?: string;
  selectedCategory?: string;
  sortBy?: string;
}

export const CertificatesList = ({ 
  courseId, 
  searchTerm = "", 
  selectedCategory = "all", 
  sortBy = "recent" 
}: CertificatesListProps) => {
  const { 
    certificates, 
    isLoading, 
    error, 
    downloadCertificate
  } = useCertificates(courseId);
  
  // Funções wrapper para compatibilizar tipos
  const handleSolutionDownload = async (certificateId: string) => {
    await downloadCertificate(certificateId);
    return { needsModal: false };
  };

  const handleCourseDownload = (certificateId: string) => {
    downloadCertificate(certificateId);
  };

  // Filtrar e ordenar certificados
  const filteredAndSortedData = useMemo(() => {
    // Separar certificados por tipo
    const courseCerts = certificates.filter(cert => cert.type === 'course');
    const solutionCerts = certificates.filter(cert => cert.type === 'solution');

    let filteredCourses = courseCerts.filter(cert => {
      const matchesSearch = !searchTerm || cert.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || selectedCategory === "courses";
      return matchesSearch && matchesCategory;
    });

    let filteredSolutions = solutionCerts.filter(cert => {
      const matchesSearch = !searchTerm || cert.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || selectedCategory === "solutions";
      return matchesSearch && matchesCategory;
    });

    // Ordenação
    const sortFunction = (a: any, b: any) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.issued_at).getTime() - new Date(b.issued_at).getTime();
        case "name":
          const nameA = (a.title || "").toLowerCase();
          const nameB = (b.title || "").toLowerCase();
          return nameA.localeCompare(nameB);
        case "name-desc":
          const nameDescA = (a.title || "").toLowerCase();
          const nameDescB = (b.title || "").toLowerCase();
          return nameDescB.localeCompare(nameDescA);
        case "recent":
        default:
          return new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime();
      }
    };

    filteredCourses.sort(sortFunction);
    filteredSolutions.sort(sortFunction);

    return {
      courseCertificates: filteredCourses,
      solutionCertificates: filteredSolutions
    };
  }, [certificates, searchTerm, selectedCategory, sortBy]);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          Ocorreu um erro ao carregar seus certificados. Por favor, tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }

  const totalCertificates = filteredAndSortedData.courseCertificates.length + filteredAndSortedData.solutionCertificates.length;
  
  if (totalCertificates === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-[#151823]/80 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm || selectedCategory !== "all" ? "Nenhum certificado encontrado" : "Nenhum certificado ainda"}
          </h3>
          <p className="text-gray-400">
            {searchTerm || selectedCategory !== "all" 
              ? "Tente ajustar os filtros de busca para encontrar seus certificados."
              : "Complete cursos e implemente soluções para receber certificados."}
          </p>
        </div>
      </div>
    );
  }

  // Se é para um curso específico, mostrar apenas certificados do curso
  if (courseId) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedData.courseCertificates.map((certificate) => (
          <CertificateCard
            key={certificate.id}
            certificate={certificate}
            onDownload={handleCourseDownload}
          />
        ))}
      </div>
    );
  }

  // Para a página geral de certificados, mostrar ambos os tipos em abas
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="w-full bg-[#151823]/80 backdrop-blur-sm border border-neutral-700/50 p-1">
        <TabsTrigger 
          value="all" 
          className="flex-1 data-[state=active]:bg-viverblue data-[state=active]:text-white text-gray-300"
        >
          Todos ({totalCertificates})
        </TabsTrigger>
        <TabsTrigger 
          value="solutions" 
          className="flex-1 data-[state=active]:bg-viverblue data-[state=active]:text-white text-gray-300"
        >
          Soluções ({filteredAndSortedData.solutionCertificates.length})
        </TabsTrigger>
        <TabsTrigger 
          value="courses" 
          className="flex-1 data-[state=active]:bg-viverblue data-[state=active]:text-white text-gray-300"
        >
          Cursos ({filteredAndSortedData.courseCertificates.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-8">
        <div className="space-y-8">
          {/* Certificados de Soluções */}
          {filteredAndSortedData.solutionCertificates.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-viverblue rounded-full"></div>
                Certificados de Implementação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedData.solutionCertificates.map((certificate) => (
                  <SolutionCertificateCard
                    key={certificate.id}
                    certificate={certificate}
                    onDownload={handleSolutionDownload}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Certificados de Cursos */}
          {filteredAndSortedData.courseCertificates.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-yellow-400 rounded-full"></div>
                Certificados de Cursos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedData.courseCertificates.map((certificate) => (
                  <CertificateCard
                    key={certificate.id}
                    certificate={certificate}
                    onDownload={handleCourseDownload}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="solutions" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedData.solutionCertificates.map((certificate) => (
            <SolutionCertificateCard
              key={certificate.id}
              certificate={certificate}
              onDownload={handleSolutionDownload}
            />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="courses" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedData.courseCertificates.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              onDownload={handleCourseDownload}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};
