import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Star, BookOpen, Award, Eye, Lightbulb, BadgeCheck } from "lucide-react";
import { UnifiedCertificate } from "@/hooks/learning/useUnifiedCertificates";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { UnifiedCertificateViewer } from "@/components/certificates/UnifiedCertificateViewer";
import { CertificateData } from "@/utils/certificates/templateEngine";
import { useAuth } from "@/contexts/auth";
import { ShareCertificateDropdown } from "./ShareCertificateDropdown";

interface UnifiedCertificateCardProps {
  certificate: UnifiedCertificate;
  onDownload: (certificateId: string) => void;
}

export const UnifiedCertificateCard = ({
  certificate,
  onDownload
}: UnifiedCertificateCardProps) => {
  const { user } = useAuth();
  
  const isSolution = certificate.type === 'solution';
  const formattedDate = format(new Date(certificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  const config = isSolution ? {
    icon: Lightbulb,
    typeLabel: "Solução",
    headerBg: "from-accent/10 to-transparent",
    badgeClass: "bg-accent/15 text-accent border-accent/30",
    iconColor: "text-accent",
    iconBg: "bg-accent/15",
    codeBoxClass: "bg-accent/10 border-accent/20",
    codeLabelColor: "text-accent"
  } : {
    icon: Award,
    typeLabel: "Curso",
    headerBg: "from-primary/10 to-transparent",
    badgeClass: "bg-primary/15 text-primary border-primary/30",
    iconColor: "text-primary",
    iconBg: "bg-primary/15",
    codeBoxClass: "bg-primary/10 border-primary/20",
    codeLabelColor: "text-primary"
  };
  
  const handleDownload = () => {
    onDownload(certificate.id);
  };
  
  return (
    <Card className="group relative overflow-hidden border hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${config.iconBg} border ${config.badgeClass.replace('bg-', 'border-').replace('/15', '/20')}`}>
              <config.icon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">
                {certificate.title}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge className={`${config.badgeClass} text-xs`}>
                  {isSolution ? <Lightbulb className="h-3 w-3 mr-1" /> : <BookOpen className="h-3 w-3 mr-1" />}
                  {config.typeLabel}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ShareCertificateDropdown
              certificate={{
                id: certificate.id,
                validation_code: certificate.validation_code,
                solutions: {
                  title: certificate.title
                }
              }}
              userProfile={{
                name: user?.user_metadata?.full_name || user?.email || "Usuário"
              }}
              compact
            />
            <div className="text-xs text-muted-foreground">
              {formattedDate}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BadgeCheck className="h-4 w-4 text-primary" />
            <span>Certificado de {isSolution ? 'Implementação' : 'Conclusão'}</span>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
              <Star className="h-3 w-3" />
              Código de Validação
            </div>
            <div className="text-sm text-foreground font-mono">
              {certificate.validation_code}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              Emitido em {formattedDate}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Baixar
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Certificado
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl w-full h-[90vh] p-0 certificate-dialog">
                  <div className="h-full overflow-auto p-6 certificate-dialog-content">
                    <UnifiedCertificateViewer
                      data={{
                        userName: user?.user_metadata?.full_name || user?.email || "Usuário",
                        solutionTitle: certificate.title,
                        solutionCategory: isSolution ? "Solução de IA" : "Curso",
                        courseTitle: !isSolution ? certificate.title : undefined,
                        implementationDate: formattedDate,
                        completedDate: formattedDate,
                        certificateId: certificate.id,
                        validationCode: certificate.validation_code
                      } as CertificateData}
                      headerTitle={`Certificado de ${isSolution ? 'Implementação' : 'Conclusão'}`}
                      headerDescription={`Parabéns! Você conquistou este certificado ao ${isSolution ? 'implementar com sucesso a solução' : 'concluir o curso'} "${certificate.title}".`}
                      scale={0.6}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};