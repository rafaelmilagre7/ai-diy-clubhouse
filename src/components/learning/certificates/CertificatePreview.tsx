import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, ExternalLink, Award, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SocialShareButtons } from "./SocialShareButtons";

interface CertificatePreviewProps {
  certificate: any;
  onDownload: () => void;
}

export const CertificatePreview = ({ certificate, onDownload }: CertificatePreviewProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const courseName = certificate.learning_courses?.title || "Curso";
  const studentName = certificate.profiles?.name || "Estudante";
  const issueDate = format(new Date(certificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const validationCode = certificate.validation_code;

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <Award className="h-3 w-3 mr-1" />
            Certificado Oficial
          </Badge>
          <Badge variant="outline">
            Válido
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Validar Online
          </Button>
          <Button onClick={onDownload} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </div>
      </div>

      {/* Certificate */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div 
            ref={certificateRef}
            className="relative bg-gradient-to-br from-white via-purple-50 to-blue-50 p-12 min-h-[600px] flex flex-col justify-center items-center text-center"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 80%, rgba(120, 53, 235, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)
              `
            }}
          >
            {/* Decorative Elements */}
            <div className="absolute top-8 left-8">
              <Sparkles className="h-8 w-8 text-purple-400 opacity-60" />
            </div>
            <div className="absolute top-8 right-8">
              <Sparkles className="h-8 w-8 text-blue-400 opacity-60" />
            </div>
            <div className="absolute bottom-8 left-8">
              <Sparkles className="h-6 w-6 text-purple-300 opacity-40" />
            </div>
            <div className="absolute bottom-8 right-8">
              <Sparkles className="h-6 w-6 text-blue-300 opacity-40" />
            </div>

            {/* Border */}
            <div className="absolute inset-4 border-4 border-gradient-to-r from-purple-400 via-blue-400 to-purple-400 rounded-lg opacity-20"></div>
            <div className="absolute inset-6 border-2 border-gradient-to-r from-blue-300 via-purple-300 to-blue-300 rounded-lg opacity-30"></div>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <Award className="h-16 w-16 text-purple-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                CERTIFICADO DE CONCLUSÃO
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded"></div>
            </div>

            {/* Content */}
            <div className="space-y-6 max-w-2xl">
              <p className="text-lg text-gray-600">
                Certificamos que
              </p>
              
              <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-purple-300 pb-2 mb-6">
                {studentName}
              </h2>
              
              <p className="text-lg text-gray-600">
                concluiu com êxito o curso
              </p>
              
              <h3 className="text-2xl font-semibold text-purple-700 leading-tight">
                {courseName}
              </h3>
              
              <div className="flex items-center justify-center space-x-8 mt-8">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Data de Emissão</p>
                  <p className="font-semibold text-gray-700">{issueDate}</p>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Código de Validação</p>
                  <p className="font-mono font-bold text-purple-600">{validationCode}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="w-32 h-px bg-gray-400 mb-2"></div>
                  <p className="text-sm font-semibold text-gray-700">Viver de IA</p>
                  <p className="text-xs text-gray-500">Formação em Inteligência Artificial</p>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-4">
                Verifique a autenticidade deste certificado em: viverdeia.ai/validar/{validationCode}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Share */}
      <div className="border-t pt-6">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Compartilhar Conquista
        </h4>
        <SocialShareButtons certificate={certificate} />
      </div>
    </div>
  );
};