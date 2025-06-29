
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, CheckCircle2, Award, Target, Zap, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

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
  
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'Receita':
        return {
          color: 'from-green-500/20 via-emerald-400/15 to-teal-400/10',
          badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30',
          iconColor: 'text-green-400',
          icon: TrendingUp
        };
      case 'Operacional':
        return {
          color: 'from-blue-500/20 via-cyan-400/15 to-sky-400/10',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          iconColor: 'text-blue-400',
          icon: Target
        };
      case 'Estratégia':
        return {
          color: 'from-purple-500/20 via-violet-400/15 to-indigo-400/10',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          iconColor: 'text-purple-400',
          icon: Zap
        };
      default:
        return {
          color: 'from-viverblue/20 via-cyan-400/15 to-blue-400/10',
          badgeColor: 'bg-viverblue/20 text-viverblue border-viverblue/30',
          iconColor: 'text-viverblue',
          icon: Award
        };
    }
  };
  
  const categoryConfig = getCategoryConfig(solution?.category);
  const CategoryIcon = categoryConfig.icon;
  
  const handleDownload = () => {
    onDownload(certificate.id);
    toast.success("Download iniciado!");
  };
  
  return (
    <Card className="group overflow-hidden bg-[#151823]/80 backdrop-blur-sm border-neutral-700/50 hover:border-viverblue/30 transition-all duration-300 hover:shadow-lg hover:shadow-viverblue/10 hover:-translate-y-1">
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
          <CheckCircle2 className="h-6 w-6 text-green-400" />
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white group-hover:text-viverblue transition-colors duration-300 line-clamp-2">
          {solution?.title || "Certificado de Implementação"}
        </CardTitle>
        <div className={`flex items-center gap-2 text-sm ${categoryConfig.iconColor}`}>
          <Award className="h-4 w-4" />
          <span className="font-medium">Implementação Concluída</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {solution?.description && (
          <p className="text-sm text-gray-400 line-clamp-2">
            {solution.description}
          </p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Calendar className={`h-4 w-4 ${categoryConfig.iconColor}`} />
            <span>Implementado em {implementationDate}</span>
          </div>
          <div className="text-xs text-gray-500">
            Certificado emitido em {issuedDate}
          </div>
        </div>
        
        <div className={`bg-gradient-to-r ${categoryConfig.color} border ${categoryConfig.badgeColor.includes('green') ? 'border-green-500/20' : categoryConfig.badgeColor.includes('blue') ? 'border-blue-500/20' : 'border-purple-500/20'} rounded-lg p-3`}>
          <div className={`text-xs font-medium mb-1 ${categoryConfig.iconColor}`}>Código de Validação</div>
          <div className="text-sm text-white font-mono bg-black/30 px-2 py-1 rounded">
            {certificate.validation_code}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button
          onClick={handleDownload}
          className={`w-full bg-gradient-to-r ${categoryConfig.color.replace(/\/20|\/15|\/10/g, '')} hover:opacity-90 text-white font-semibold transition-all duration-300 group-hover:shadow-lg`}
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar Certificado
        </Button>
      </CardFooter>
    </Card>
  );
};
