
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Award } from "lucide-react";
import { Certificate } from "@/types/learningTypes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface CertificateCardProps {
  certificate: Certificate;
  onDownload: (certificateId: string) => void;
}

export const CertificateCard = ({
  certificate,
  onDownload
}: CertificateCardProps) => {
  const course = (certificate as any).learning_courses;
  const formattedDate = format(new Date(certificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  const handleOpenCertificate = () => {
    if (certificate.certificate_url) {
      window.open(certificate.certificate_url, '_blank');
    } else {
      toast.error("Certificado não disponível para visualização");
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary/20 to-primary/5 pb-2 pt-6">
        <div className="flex justify-center">
          <Award className="h-20 w-20 text-primary/80" />
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          {course?.title || "Certificado de Conclusão"}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <p>Emitido em: {formattedDate}</p>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload(certificate.id)}
          className="flex gap-1 w-full sm:w-auto"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="flex gap-1 w-full sm:w-auto"
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
