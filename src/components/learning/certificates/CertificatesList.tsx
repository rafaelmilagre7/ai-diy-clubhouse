
import React from "react";
import { CertificateCard } from "./CertificateCard";
import { useUserCertificates } from "@/hooks/learning/useUserCertificates";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CertificatesListProps {
  courseId?: string;
}

export const CertificatesList = ({ courseId }: CertificatesListProps) => {
  const { 
    certificates, 
    isLoading, 
    error, 
    downloadCertificate
  } = useUserCertificates(courseId);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-40 w-full" />
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
  
  if (certificates.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Nenhum certificado encontrado</AlertTitle>
        <AlertDescription>
          {courseId 
            ? "Você ainda não possui certificado para este curso. Complete todas as aulas para receber seu certificado."
            : "Você ainda não possui nenhum certificado. Complete cursos para receber certificados."}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {certificates.map((certificate) => (
        <CertificateCard
          key={certificate.id}
          certificate={certificate}
          onDownload={downloadCertificate}
        />
      ))}
    </div>
  );
};
