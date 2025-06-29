
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Star, Calendar, BookOpen, Award, Eye } from "lucide-react";
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
  const [showPreview, setShowPreview] = useState(false);
  const course = (certificate as any).learning_courses;
  const formattedDate = format(new Date(certificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  const handleDownload = () => {
    onDownload(certificate.id);
    toast.success("Download iniciado!");
  };

  const handlePreview = () => {
    toast.info("Preview em desenvolvimento para certificados de curso");
  };
  
  return (
    <Card className="group overflow-hidden bg-[#151823]/80 backdrop-blur-sm border-neutral-700/50 hover:border-yellow-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10 hover:-translate-y-1">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-br from-yellow-400/20 via-amber-400/15 to-orange-400/10 pb-4 pt-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent"></div>
        <div className="flex justify-center relative z-10">
          <div className="bg-yellow-400/20 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
            <Award className="h-16 w-16 text-yellow-400" />
          </div>
        </div>
        
        {/* Badge de tipo */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30">
            <BookOpen className="h-3 w-3 mr-1" />
            Curso
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2">
          {course?.title || "Certificado de Conclusão"}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-yellow-400">
          <Star className="h-4 w-4 fill-current" />
          <span className="font-medium">Certificado de Conclusão</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Calendar className="h-4 w-4 text-yellow-400" />
          <span>Emitido em {formattedDate}</span>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-400/10 to-amber-400/5 border border-yellow-400/20 rounded-lg p-3">
          <div className="text-xs text-yellow-300 font-medium mb-1">Código de Validação</div>
          <div className="text-sm text-white font-mono bg-black/30 px-2 py-1 rounded">
            {certificate.validation_code}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex gap-2">
        <Button
          onClick={handleDownload}
          className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-black font-semibold transition-all duration-300 group-hover:shadow-lg group-hover:shadow-yellow-400/25"
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar Certificado
        </Button>
        
        <Button
          onClick={handlePreview}
          variant="outline"
          className="border-neutral-600 text-gray-300 hover:bg-neutral-800"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
