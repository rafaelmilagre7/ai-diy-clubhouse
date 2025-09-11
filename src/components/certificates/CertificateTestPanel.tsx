import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, FileImage, Download, ExternalLink, X } from 'lucide-react';
import { templateEngine, pdfGenerator } from '@/utils/certificates';
import { CertificateRefreshButton } from './CertificateRefreshButton';
import { useOptimizedCertificateGeneration } from '@/hooks/useOptimizedCertificateGeneration';
import OptimizedLoadingScreen from '@/components/common/OptimizedLoadingScreen';
import { toast } from 'sonner';

export const CertificateTestPanel = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { 
    generateWithRetry, 
    generationState, 
    loadingState,
    updateProgress,
    cancelGeneration,
    isGenerating 
  } = useOptimizedCertificateGeneration({
    maxAttempts: 3,
    timeoutMs: 30000,
    showProgress: true
  });

  const generateTestCertificate = async () => {
    if (isGenerating) return;

    const result = await generateWithRetry(async () => {
      console.log('🧪 [CERT-TEST] Iniciando geração de certificado de teste...');
      
      const testData = {
        userName: "João Silva Santos",
        solutionTitle: "Sistema de Automação com IA",
        solutionCategory: "Inteligência Artificial",
        implementationDate: "15 de dezembro de 2024",
        certificateId: `TEST-${Date.now()}`,
        validationCode: `VAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      };

      updateProgress('Processando template...', 20);
      const template = templateEngine.generateDefaultTemplate();
      const html = templateEngine.processTemplate(template, testData);
      const css = templateEngine.optimizeCSS(template.css_styles);
      
      updateProgress('Gerando PDF...', 60);
      const blob = await pdfGenerator.generateFromHTML(html, css, testData);
      
      updateProgress('Criando preview...', 90);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      
      return { blob, url };
    }, 'certificado de teste');

    if (result) {
      console.log('🎉 [CERT-TEST] Certificado de teste gerado com sucesso');
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
              Teste o certificado com timeout e retry automático
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            Versão 5.0
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
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {generationState.currentStep || 'Gerando...'}
                {loadingState.progress > 0 && ` (${Math.round(loadingState.progress)}%)`}
              </>
            ) : (
              <>
                <FileImage className="w-4 h-4 mr-2" />
                Gerar Certificado de Teste
              </>
            )}
          </Button>

          {isGenerating && (
            <Button
              onClick={cancelGeneration}
              variant="outline"
              size="sm"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar Geração
            </Button>
          )}

          {isGenerating && (
            <OptimizedLoadingScreen
              message={`${generationState.currentStep} (Tentativa ${generationState.attempt}/${generationState.maxAttempts})`}
              showProgress={true}
              progressValue={loadingState.progress}
              variant="dots"
              size="sm"
              className="py-4"
            />
          )}

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
          <h4 className="font-medium text-emerald-900 mb-2">Correções Implementadas:</h4>
          <ul className="text-sm text-emerald-800 space-y-1">
            <li>✅ Timeout máximo de 30 segundos</li>
            <li>✅ Sistema de retry (até 3 tentativas)</li>
            <li>✅ Error handling robusto</li>
            <li>✅ Cleanup automático de DOM</li>
            <li>✅ Loading state detalhado</li>
            <li>✅ Botão de cancelar operação</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};