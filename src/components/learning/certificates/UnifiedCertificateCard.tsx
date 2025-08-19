import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Star, Calendar, BookOpen, Award, Eye, Lightbulb, Trophy, Sparkles } from "lucide-react";
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
  
  // Configurações baseadas no tipo
  const config = isSolution ? {
    icon: Lightbulb,
    typeLabel: "Solução",
    gradient: "from-blue-500/20 via-purple-500/15 to-indigo-500/10",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-400/20",
    buttonGradient: "from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500",
    codeGradient: "from-blue-400/10 to-purple-400/5 border-blue-400/20",
    codeLabelColor: "text-blue-300"
  } : {
    icon: Award,
    typeLabel: "Curso",
    gradient: "from-yellow-400/20 via-amber-400/15 to-orange-400/10",
    badgeColor: "bg-yellow-400/20 text-yellow-300 border-yellow-400/30",
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-400/20",
    buttonGradient: "from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500",
    codeGradient: "from-yellow-400/10 to-amber-400/5 border-yellow-400/20",
    codeLabelColor: "text-yellow-300"
  };
  
  const handleDownload = () => {
    onDownload(certificate.id);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
    >
      <Card className={`
        relative overflow-hidden border-border/50 backdrop-blur-sm transition-all duration-500
        hover:shadow-2xl hover:shadow-current/20 hover:border-primary/50
        bg-gradient-to-br from-card/80 via-card/60 to-card/40
      `}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
        </div>
        
        {/* Header com gradiente e animação */}
        <div className={`bg-gradient-to-br ${config.gradient} pb-6 pt-8 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          
          {/* Elementos decorativos */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-4 right-4 opacity-20"
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>
          
          <div className="flex justify-center relative z-10">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`${config.iconBg} rounded-full p-4 group-hover:shadow-lg transition-all duration-300`}
            >
              <config.icon className={`h-16 w-16 ${config.iconColor}`} />
            </motion.div>
          </div>
          
          {/* Badge de tipo */}
          <div className="absolute top-4 left-4">
            <Badge className={`${config.badgeColor} backdrop-blur-sm`}>
              {isSolution ? <Lightbulb className="h-3 w-3 mr-1" /> : <BookOpen className="h-3 w-3 mr-1" />}
              {config.typeLabel}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-3 relative">
          <CardTitle className={`
            text-lg font-semibold text-foreground line-clamp-2 leading-tight
            group-hover:${config.iconColor} transition-colors duration-300
          `}>
            {certificate.title}
          </CardTitle>
          <div className={`flex items-center gap-2 text-sm ${config.iconColor}`}>
            <Trophy className="h-4 w-4 fill-current" />
            <span className="font-medium">Certificado de {isSolution ? 'Implementação' : 'Conclusão'}</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className={`flex items-center gap-2 text-sm text-muted-foreground`}>
            <Calendar className={`h-4 w-4 ${config.iconColor}`} />
            <span>Emitido em {formattedDate}</span>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-r ${config.codeGradient} rounded-lg p-4 backdrop-blur-sm`}
          >
            <div className={`text-xs ${config.codeLabelColor} font-medium mb-2 flex items-center gap-1`}>
              <Star className="h-3 w-3" />
              Código de Validação
            </div>
            <div className="text-sm text-foreground font-mono bg-background/50 px-3 py-2 rounded border border-border/50">
              {certificate.validation_code}
            </div>
          </motion.div>
        </CardContent>
        
        <CardFooter className="pt-0 flex gap-2">
          <Button
            onClick={handleDownload}
            className={`
              flex-1 bg-gradient-to-r ${config.buttonGradient} 
              text-background font-semibold transition-all duration-300 
              hover:shadow-lg hover:shadow-current/25 border-0
            `}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
              <div className="h-full overflow-auto p-6">
                <UnifiedCertificateViewer
                  data={{
                    userName: user?.user_metadata?.full_name || user?.email || "Usuário",
                    solutionTitle: certificate.title,
                    solutionCategory: isSolution ? "Solução de IA" : "Curso",
                    implementationDate: formattedDate,
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
          
          {isSolution && (
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
            />
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};