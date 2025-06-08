
import React from "react";
import { CertificatesList } from "@/components/learning/certificates/CertificatesList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Award } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { APP_CONFIG } from "@/config/app";

const MemberCertificates = () => {
  const { user } = useAuth();
  
  const handleOpenCertificateForm = () => {
    const certificateUrl = APP_CONFIG.getAppUrl('/certificado/validar');
    window.open(certificateUrl, '_blank');
  };
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Meus Certificados</h1>
          <p className="text-gray-300 mt-1">
            Aqui você encontra todos os certificados obtidos em seus cursos e implementações de soluções.
          </p>
        </div>
        
        {/* Seção de acesso ao formulário de certificados */}
        <Card className="bg-[#151823] border-neutral-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5" />
              Validação de Certificados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Acesse o formulário de validação para verificar a autenticidade de qualquer certificado emitido pela plataforma.
            </p>
            <Button
              onClick={handleOpenCertificateForm}
              className="bg-viverblue hover:bg-viverblue/90 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Certificado
            </Button>
          </CardContent>
        </Card>
        
        {/* Lista de certificados */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Seus Certificados</h2>
          <CertificatesList />
        </div>
      </div>
    </div>
  );
};

export default MemberCertificates;
