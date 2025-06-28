
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Calendar, Shield } from "lucide-react";
import { useCertificates } from "@/hooks/learning/useCertificates";
import { useSolutionCertificates } from "@/hooks/learning/useSolutionCertificates";

interface CertificatesListProps {
  courseId?: string;
  solutionId?: string;
}

export const CertificatesList = ({ courseId, solutionId }: CertificatesListProps) => {
  const courseCertificates = useCertificates(courseId);
  const solutionCertificates = useSolutionCertificates(solutionId || '');

  // Use the appropriate hook based on the props
  const {
    certificates,
    isLoading,
    downloadCertificate,
    validateCertificate
  } = courseId ? courseCertificates : solutionCertificates;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
      </div>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <div className="text-center py-8">
        <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">Nenhum certificado encontrado</h3>
        <p className="text-gray-500">
          Complete cursos ou implemente soluções para obter certificados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {certificates.map((certificate) => (
        <Card key={certificate.id} className="bg-[#151823] border-neutral-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-viverblue/10 rounded-lg">
                  <Award className="h-6 w-6 text-viverblue" />
                </div>
                <div>
                  <CardTitle className="text-white">
                    {courseId ? 'Certificado de Curso' : 'Certificado de Implementação'}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      Emitido em {new Date(certificate.issued_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                Válido
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Shield className="h-4 w-4" />
              <span>Código de validação: {certificate.validation_code}</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => downloadCertificate && downloadCertificate(certificate.id)}
                className="bg-viverblue hover:bg-viverblue/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => validateCertificate && validateCertificate(certificate.validation_code)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Shield className="h-4 w-4 mr-2" />
                Validar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
