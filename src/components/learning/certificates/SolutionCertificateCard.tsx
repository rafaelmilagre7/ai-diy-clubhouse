
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, CheckCircle2, Award, Target, Zap, TrendingUp, Eye, Printer } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CertificateModal } from "./CertificateModal";

interface SolutionCertificateCardProps {
  certificate: any;
  onDownload: (certificateId: string) => Promise<{ needsModal: boolean; certificate?: any }>;
}

export const SolutionCertificateCard = ({
  certificate,
  onDownload
}: SolutionCertificateCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [pendingCertificate, setPendingCertificate] = useState<any>(null);
  
  const solution = certificate.solutions;
  const implementationDate = format(new Date(certificate.implementation_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const issuedDate = format(new Date(certificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'Receita':
        return {
          color: 'from-operational/20 via-operational/15 to-operational/10',
          badgeColor: 'bg-operational/20 text-operational border-operational/30',
          iconColor: 'text-operational',
          buttonColor: 'from-operational to-operational/80 hover:from-operational/90 hover:to-operational/70',
          icon: TrendingUp
        };
      case 'Operacional':
        return {
          color: 'from-operational/20 via-operational/15 to-operational/10',
          badgeColor: 'bg-operational/20 text-operational border-operational/30',
          iconColor: 'text-operational',
          buttonColor: 'from-operational to-operational/80 hover:from-operational/90 hover:to-operational/70',
          icon: Target
        };
      case 'Estratégia':
        return {
          color: 'from-strategy/20 via-strategy/15 to-strategy/10',
          badgeColor: 'bg-strategy/20 text-strategy border-strategy/30',
          iconColor: 'text-strategy',
          buttonColor: 'from-strategy to-strategy/80 hover:from-strategy/90 hover:to-strategy/70',
          icon: Zap
        };
      default:
        return {
          color: 'from-aurora-primary/20 via-cyan-400/15 to-blue-400/10',
          badgeColor: 'bg-aurora-primary/20 text-aurora-primary border-aurora-primary/30',
          iconColor: 'text-aurora-primary',
          buttonColor: 'from-aurora-primary to-cyan-500 hover:from-aurora-primary/90 hover:to-cyan-600',
          icon: Award
        };
    }
  };
  
  const categoryConfig = getCategoryConfig(solution?.category);
  const CategoryIcon = categoryConfig.icon;
  const hasCachedPDF = certificate.certificate_url && certificate.certificate_filename;
  
  const handleDownload = async () => {
    const result = await onDownload(certificate.id);
    
    if (result.needsModal && result.certificate) {
      setPendingCertificate(result.certificate);
      setShowModal(true);
    }
  };

  const handlePreview = () => {
    setPendingCertificate(certificate);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPendingCertificate(null);
  };
  
  return (
    <>
      <Card className="group overflow-hidden bg-card/80 backdrop-blur-sm border-border hover:border-aurora-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-aurora-primary/10 hover:-translate-y-1">
        {/* Header com gradiente dinâmico */}
        <div className={`bg-gradient-to-br ${categoryConfig.color} pb-4 pt-8 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="flex justify-center relative z-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
              <Award className={`h-16 w-16 ${categoryConfig.iconColor}`} />
            </div>
          </div>
          
          {/* Badge de categoria */}
          <div className="absolute top-4 right-4">
            <Badge className={categoryConfig.badgeColor}>
              <CategoryIcon className="h-3 w-3 mr-1" />
              {solution?.category}
            </Badge>
          </div>
          
          {/* Status de conclusão */}
          <div className="absolute top-4 left-4">
            <CheckCircle2 className="h-6 w-6 text-system-healthy" />
            {hasCachedPDF && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-system-healthy rounded-full animate-pulse" />
            )}
          </div>
        </div>
        
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white group-hover:text-aurora-primary transition-colors duration-300 line-clamp-2">
            {solution?.title || "Certificado de Implementação"}
          </CardTitle>
          <div className={`flex items-center gap-2 text-sm ${categoryConfig.iconColor}`}>
            <Award className="h-4 w-4" />
            <span className="font-medium">Implementação Concluída</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {solution?.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {solution.description}
            </p>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Calendar className={`h-4 w-4 ${categoryConfig.iconColor}`} />
              <span>Implementado em {implementationDate}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Certificado emitido em {issuedDate}
            </div>
          </div>
          
          <div className={`bg-gradient-to-r ${categoryConfig.color} border border-border rounded-lg p-3`}>
            <div className={`text-xs font-medium mb-1 ${categoryConfig.iconColor}`}>Código de Validação</div>
            <div className="text-sm text-white font-mono bg-black/30 px-2 py-1 rounded">
              {certificate.validation_code}
            </div>
          </div>

          {hasCachedPDF && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-system-healthy/10 border border-system-healthy/20 rounded-full text-system-healthy text-xs">
                ✓ Pronto para download
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 flex gap-2">
          <Button
            onClick={handlePreview}
            className={`flex-1 bg-gradient-to-r ${categoryConfig.buttonColor} text-white font-semibold transition-all duration-300 group-hover:shadow-lg`}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          
          <Button
            onClick={handleDownload}
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
            title="Baixar PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handlePreview}
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {pendingCertificate && (
        <CertificateModal
          certificate={pendingCertificate}
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};
