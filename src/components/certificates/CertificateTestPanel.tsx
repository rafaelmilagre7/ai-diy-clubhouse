import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileImage, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { CertificateRefreshButton } from './CertificateRefreshButton';
import { templateEngine, pdfGenerator } from '@/utils/certificates';
import { toast } from 'sonner';

export const CertificateTestPanel = () => {
  const [isGeneratingPreview, setIsGeneratingPreview] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const generateTestCertificate = async () => {
    setIsGeneratingPreview(true);
    
    try {
      // Dados de teste
      const testData = {
        userName: 'Nicholas Machado',
        solutionTitle: 'Formação Lovable - Desenvolvimento IA',
        solutionCategory: 'Formação Técnica',
        implementationDate: new Date().toLocaleDateString('pt-BR'),
        certificateId: 'TEST-' + Date.now(),
        validationCode: 'LOVABLE-' + Math.random().toString(36).substr(2, 8).toUpperCase()
      };

      // Gerar template pixel-perfect
      const template = templateEngine.generatePixelPerfectTemplate();
      const html = templateEngine.processTemplate(template, testData);
      const css = templateEngine.optimizeCSS(template.css_styles);

      // Gerar PDF
      const blob = await pdfGenerator.generateFromHTML(html, css, testData);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      toast.success('Certificado pixel-perfect gerado!', {
        description: 'Novo design baseado na imagem de referência aplicado'
      });

    } catch (error) {
      console.error('Erro ao gerar certificado de teste:', error);
      toast.error('Erro ao gerar certificado de teste');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const downloadTest = () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = 'certificado-teste-lovable.pdf';
      link.click();
    }
  };

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="w-5 h-5 text-emerald-600" />
              Teste do Novo Design
            </CardTitle>
            <CardDescription>
              Teste o certificado com o novo fundo verde/turquesa
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            Versão 4.0
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <CertificateRefreshButton variant="template" size="sm" />
            <CertificateRefreshButton variant="refresh" size="sm" />
          </div>

          <Button 
            onClick={generateTestCertificate}
            disabled={isGeneratingPreview}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {isGeneratingPreview ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Gerando Certificado...
              </>
            ) : (
              <>
                <FileImage className="w-4 h-4 mr-2" />
                Gerar Certificado de Teste
              </>
            )}
          </Button>

          {previewUrl && (
            <div className="flex gap-2">
              <Button 
                onClick={downloadTest}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              
              <Button 
                onClick={openInNewTab}
                variant="outline"
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visualizar
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <h4 className="font-medium text-emerald-900 mb-2">Novo Design Pixel-Perfect:</h4>
          <ul className="text-sm text-emerald-800 space-y-1">
            <li>✅ Design idêntico à imagem de referência</li>
            <li>✅ Fundo escuro (#0A0D0F) com moldura turquesa</li>
            <li>✅ Tipografia precisa "VIVER DE IA"</li>
            <li>✅ Proporção 4:3 responsiva (1200×900px)</li>
            <li>✅ Background preservado no PDF</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};