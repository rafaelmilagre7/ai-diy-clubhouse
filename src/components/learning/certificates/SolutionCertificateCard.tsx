
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Award, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SolutionCertificateCardProps {
  certificate: any;
  onDownload: (certificateId: string) => void;
}

export const SolutionCertificateCard = ({
  certificate,
  onDownload
}: SolutionCertificateCardProps) => {
  const solution = certificate.solutions;
  const implementationDate = format(new Date(certificate.implementation_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const issuedDate = format(new Date(certificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Receita':
        return 'bg-green-900/30 text-green-300 border-green-700';
      case 'Operacional':
        return 'bg-blue-900/30 text-blue-300 border-blue-700';
      case 'Estratégia':
        return 'bg-purple-900/30 text-purple-300 border-purple-700';
      default:
        return 'bg-gray-800/50 text-gray-300 border-gray-700';
    }
  };
  
  const handleOpenCertificate = () => {
    if (certificate.certificate_url) {
      window.open(certificate.certificate_url, '_blank');
    }
  };
  
  return (
    <Card className="overflow-hidden bg-[#151823] border-neutral-700/50 hover:border-viverblue/30 transition-all duration-200">
      <div className="bg-gradient-to-r from-viverblue/20 to-viverblue/5 pb-2 pt-6">
        <div className="flex justify-center">
          <div className="bg-viverblue/20 rounded-full p-4">
            <Award className="h-12 w-12 text-viverblue" />
          </div>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-white">
              {solution?.title || "Certificado de Implementação"}
            </CardTitle>
            <Badge className={`${getCategoryColor(solution?.category)} border`}>
              {solution?.category}
            </Badge>
          </div>
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Calendar className="h-4 w-4" />
            <span>Implementado em: {implementationDate}</span>
          </div>
          <div className="text-sm text-gray-400">
            Certificado emitido em: {issuedDate}
          </div>
        </div>
        
        {solution?.description && (
          <p className="text-sm text-gray-400 line-clamp-2">
            {solution.description}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload(certificate.id)}
          className="flex gap-1 bg-transparent border-viverblue/20 text-viverblue hover:bg-viverblue/10 hover:text-viverblue"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="flex gap-1 text-gray-400 hover:text-white"
          onClick={handleOpenCertificate}
          disabled={!certificate.certificate_url}
        >
          <ExternalLink className="h-4 w-4" />
          Abrir Certificado
        </Button>
      </CardFooter>
    </Card>
  );
};
