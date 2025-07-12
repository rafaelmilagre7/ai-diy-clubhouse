
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { safeDocumentWrite } from '@/utils/htmlSanitizer';

export const usePDFGenerator = () => {
  const isGenerating = useRef(false);

  const generatePDF = async (element: HTMLElement, filename: string, certificateId?: string) => {
    if (isGenerating.current) {
      console.log('⚠️ Geração já em andamento, ignorando nova solicitação');
      return null;
    }

    try {
      isGenerating.current = true;
      console.log('🏭 Iniciando geração de PDF:', { filename, certificateId });

      // Aguardar um pouco para garantir renderização completa
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1123,
        height: 794,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1123,
        windowHeight: 794
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1123, 794]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 1123, 794, undefined, 'FAST');
      
      // Gerar blob local
      const pdfBlob = pdf.output('blob');
      const localUrl = URL.createObjectURL(pdfBlob);

      console.log('✅ PDF gerado com sucesso:', { 
        filename, 
        blobSize: pdfBlob.size,
        certificateId 
      });

      // Upload em background para cache futuro (não bloqueia download)
      if (certificateId) {
        uploadToSupabaseBackground(pdfBlob, filename, certificateId);
      }

      return {
        blob: pdfBlob,
        url: localUrl,
        filename
      };

    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
      return null;
    } finally {
      isGenerating.current = false;
    }
  };

  const uploadToSupabaseBackground = async (blob: Blob, filename: string, certificateId: string) => {
    try {
      console.log('📤 Upload em background iniciado:', filename);
      
      const filePath = `certificates/${certificateId}/${filename}`;
      
      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, blob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);

      // Atualizar registro do certificado com URL
      const { error: updateError } = await supabase
        .from('solution_certificates')
        .update({
          certificate_url: publicUrl,
          certificate_filename: filename
        })
        .eq('id', certificateId);

      if (updateError) throw updateError;

      console.log('✅ Upload em background concluído:', publicUrl);
    } catch (error) {
      console.error('⚠️ Erro no upload em background (não crítico):', error);
    }
  };

  const downloadPDF = (url: string, filename: string, isLocalBlob: boolean = false) => {
    try {
      console.log('💾 Iniciando download:', { filename, isLocalBlob });
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpar URL local após download
      if (isLocalBlob) {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }

      console.log('✅ Download iniciado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao fazer download:', error);
      toast.error('Erro ao fazer download');
    }
  };

  const openCertificateInNewTab = async (element: HTMLElement, data: any) => {
    try {
      console.log('🖨️ Gerando página HTML para impressão...');

      // Capturar o HTML e CSS do certificado
      const certificateHtml = element.innerHTML;
      const styles = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            return '';
          }
        })
        .join('\n');

      // Criar página HTML completa
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Certificado - ${data.solutionTitle}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Dancing+Script:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            ${styles}
            body {
              margin: 0;
              padding: 20px;
              background: #f5f5f5;
              font-family: 'Inter', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .print-container {
              background: white;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              border-radius: 8px;
              overflow: hidden;
            }
            .print-instructions {
              background: #e3f2fd;
              padding: 15px;
              text-align: center;
              border-bottom: 1px solid #ddd;
              font-size: 14px;
              color: #1976d2;
            }
            @media print {
              body { 
                background: white; 
                padding: 0;
              }
              .print-instructions { 
                display: none; 
              }
              .print-container {
                box-shadow: none;
                border-radius: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="print-instructions">
              <strong>📄 Certificado pronto para impressão</strong><br>
              Use Ctrl+P (Cmd+P no Mac) para imprimir ou salvar como PDF
            </div>
            ${certificateHtml}
          </div>
        </body>
        </html>
      `;

      // Abrir em nova aba usando método seguro
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        safeDocumentWrite(fullHtml, newWindow);
        console.log('✅ Página de impressão aberta em nova aba (método seguro)');
      } else {
        throw new Error('Não foi possível abrir nova aba');
      }

    } catch (error) {
      console.error('❌ Erro ao abrir para impressão:', error);
      toast.error('Erro ao abrir certificado para impressão');
    }
  };

  return {
    generatePDF,
    downloadPDF,
    openCertificateInNewTab,
    isGenerating: isGenerating.current
  };
};
