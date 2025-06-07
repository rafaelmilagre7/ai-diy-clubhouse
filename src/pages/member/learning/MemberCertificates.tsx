
import React, { useState } from "react";
import { CertificatesList } from "@/components/learning/certificates/CertificatesList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/auth";

const MemberCertificates = () => {
  const { user } = useAuth();
  const [validationCode, setValidationCode] = useState("");
  
  const handleValidateCode = () => {
    if (validationCode.trim()) {
      window.open(`/certificado/validar/${validationCode.trim()}`, '_blank');
    }
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
        
        {/* Seção de validação de certificados */}
        <Card className="bg-[#151823] border-neutral-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Validar Certificado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="validation_code" className="text-gray-300">
                  Código de Validação
                </Label>
                <Input
                  id="validation_code"
                  value={validationCode}
                  onChange={(e) => setValidationCode(e.target.value)}
                  placeholder="Digite o código de validação (ex: ABCD-1234-XYZ9)"
                  className="bg-[#1A1E2E] border-neutral-600 text-white placeholder:text-gray-500 mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleValidateCode}
                  disabled={!validationCode.trim()}
                  className="bg-viverblue hover:bg-viverblue/90 text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Validar
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Use esta ferramenta para verificar a autenticidade de qualquer certificado emitido pela plataforma.
            </p>
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
