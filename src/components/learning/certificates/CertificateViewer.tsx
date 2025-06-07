
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CertificateViewerProps {
  certificate: {
    id: string;
    validation_code: string;
    implementation_date: string;
    solutions: {
      title: string;
      category: string;
    };
  };
  userProfile: {
    name: string;
    email: string;
  };
  onDownload: () => void;
  onShare: () => void;
  onValidate: () => void;
}

export const CertificateViewer = ({
  certificate,
  userProfile,
  onDownload,
  onShare,
  onValidate,
}: CertificateViewerProps) => {
  const formattedDate = format(new Date(certificate.implementation_date), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR
  });

  return (
    <div className="space-y-6">
      {/* Certificado Visual */}
      <Card className="bg-gradient-to-br from-viverblue/20 to-purple-900/20 border-viverblue/30 overflow-hidden">
        <CardContent className="p-8 relative">
          {/* Padrão decorativo de fundo */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}></div>
          </div>
          
          <div className="relative z-10 text-center space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">CERTIFICADO</h1>
              <p className="text-xl text-viverblue font-semibold">de Implementação de Solução</p>
            </div>

            {/* Conteúdo principal */}
            <div className="space-y-4">
              <p className="text-lg text-gray-300">
                Certificamos que
              </p>
              
              <div className="py-4 px-6 bg-white/10 rounded-lg backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white">{userProfile.name}</h2>
              </div>
              
              <p className="text-lg text-gray-300">
                concluiu com sucesso a implementação da solução
              </p>
              
              <div className="py-4 px-6 bg-viverblue/20 rounded-lg border border-viverblue/30">
                <h3 className="text-xl font-semibold text-white">{certificate.solutions.title}</h3>
                <p className="text-viverblue text-sm mt-1">Categoria: {certificate.solutions.category}</p>
              </div>
              
              <p className="text-gray-300">
                em <span className="font-semibold text-white">{formattedDate}</span>
              </p>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-white/20 space-y-2">
              <p className="text-sm text-gray-400">
                Código de Validação: <span className="font-mono text-viverblue">{certificate.validation_code}</span>
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span>Emitido por</span>
                <span className="font-semibold text-viverblue">Viver de IA</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onDownload}
          className="bg-viverblue hover:bg-viverblue/90 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar PDF
        </Button>
        
        <Button
          onClick={onShare}
          variant="outline"
          className="border-viverblue/50 text-viverblue hover:bg-viverblue/10"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
        
        <Button
          onClick={onValidate}
          variant="outline"
          className="border-neutral-600 text-gray-300 hover:bg-neutral-700"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Validar Certificado
        </Button>
      </div>
    </div>
  );
};
