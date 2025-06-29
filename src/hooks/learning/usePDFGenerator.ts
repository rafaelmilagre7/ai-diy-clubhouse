
import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Função para aguardar carregamento das fontes
  const waitForFonts = (): Promise<void> => {
    return new Promise((resolve) => {
      if ('fonts' in document) {
        document.fonts.ready.then(() => {
          console.log('✅ Fontes carregadas para PDF');
          resolve();
        });
      } else {
        // Fallback para navegadores mais antigos
        setTimeout(() => {
          console.log('⚠️ Aguardando fontes (fallback)');
          resolve();
        }, 1000);
      }
    });
  };

  // Nova função para abrir certificado em nova aba como HTML
  const openCertificateInNewTab = async (
    certificateElement: HTMLElement,
    certificateData: any
  ): Promise<void> => {
    setIsGenerating(true);
    
    try {
      console.log('🔄 Gerando página HTML para nova aba...');
      
      // Aguardar carregamento das fontes
      await waitForFonts();
      
      // Obter o HTML e CSS do certificado
      const certificateHTML = certificateElement.innerHTML;
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            return '';
          }
        })
        .join('\n');

      // Criar página HTML completa
      const fullHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado - ${certificateData.solutionTitle}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Dancing+Script:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-display: block !important;
            -webkit-font-feature-settings: "kern" 1;
            font-feature-settings: "kern" 1;
            text-rendering: optimizeLegibility;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .certificate-container {
            width: 1123px;
            height: 794px;
            max-width: 100%;
            background: white;
            border: 2px solid #374151;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        .instructions {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1f2937;
            color: white;
            padding: 15px;
            border-radius: 8px;
            max-width: 300px;
            font-size: 14px;
            z-index: 1000;
        }
        
        .instructions h3 {
            margin-bottom: 10px;
            color: #60a5fa;
        }
        
        .instructions ul {
            margin-left: 15px;
        }
        
        .instructions li {
            margin-bottom: 5px;
        }
        
        @media print {
            .instructions {
                display: none;
            }
            
            body {
                margin: 0;
                padding: 0;
            }
            
            .certificate-container {
                width: 100% !important;
                height: 100vh !important;
                border: none !important;
                box-shadow: none !important;
                page-break-inside: avoid;
            }
            
            @page {
                size: A4 landscape;
                margin: 0;
            }
        }
        
        ${styles}
    </style>
</head>
<body>
    <div class="instructions">
        <h3>📋 Como salvar o certificado:</h3>
        <ul>
            <li><strong>Ctrl+P</strong> para imprimir</li>
            <li>Escolha <strong>"Salvar como PDF"</strong></li>
            <li>Selecione orientação <strong>Paisagem</strong></li>
            <li>Desmarque cabeçalhos/rodapés</li>
        </ul>
    </div>
    
    <div class="certificate-container">
        ${certificateHTML}
    </div>
</body>
</html>`;

      // Criar blob e abrir em nova aba
      const blob = new Blob([fullHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const newWindow = window.open(url, '_blank');
      
      if (newWindow) {
        console.log('✅ Certificado aberto em nova aba');
        toast.success('Certificado aberto! Use Ctrl+P para imprimir ou salvar como PDF.');
        
        // Limpar URL após um tempo
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 10000);
      } else {
        toast.error('Pop-up foi bloqueado. Permita pop-ups para este site.');
      }
      
    } catch (error) {
      console.error('❌ Erro ao abrir certificado em nova aba:', error);
      toast.error('Erro ao abrir certificado para impressão');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = async (
    certificateElement: HTMLElement,
    filename: string,
    certificateId: string
  ): Promise<{ url: string; filename: string; blob: Blob } | null> => {
    setIsGenerating(true);
    
    try {
      console.log('🔄 Iniciando geração de PDF para certificado:', certificateId);
      
      // Aguardar carregamento das fontes
      await waitForFonts();
      
      // Aguardar um pouco mais para garantir que tudo está renderizado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('📸 Capturando elemento como canvas...');
      
      // Capturar o elemento HTML como canvas com configurações otimizadas
      const canvas = await html2canvas(certificateElement, {
        scale: 3, // Maior qualidade
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: 1123,
        height: 794,
        logging: false, // Desabilitar logs do html2canvas
        onclone: (clonedDoc) => {
          // Garantir que as fontes estão aplicadas no clone
          const styleEl = clonedDoc.createElement('style');
          styleEl.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Dancing+Script:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
            * { font-display: block !important; }
          `;
          clonedDoc.head.appendChild(styleEl);
        }
      });

      console.log('📄 Criando PDF...');

      // Criar PDF no formato paisagem A4
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm', 
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdfWidth = 297; // A4 paisagem
      const pdfHeight = 210;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Converter para Blob
      const pdfBlob = pdf.output('blob');
      
      console.log('☁️ Fazendo upload para Supabase (background)...');

      // Upload para Supabase Storage (em background, não bloquear download)
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('certificates')
          .upload(`solution-certificates/${filename}`, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (!uploadError) {
          // Obter URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('certificates')
            .getPublicUrl(`solution-certificates/${filename}`);

          console.log('🔄 Atualizando registro do certificado...');

          // Atualizar registro do certificado com a URL
          await supabase
            .from('solution_certificates')
            .update({
              certificate_url: publicUrl,
              certificate_filename: filename
            })
            .eq('id', certificateId);

          console.log('✅ PDF salvo no Supabase com sucesso!');
        }
      } catch (uploadError) {
        console.warn('⚠️ Erro no upload para Supabase (não crítico):', uploadError);
      }

      console.log('✅ PDF gerado com sucesso!');

      // Retornar blob local para download imediato
      const blobUrl = URL.createObjectURL(pdfBlob);

      return {
        url: blobUrl,
        filename,
        blob: pdfBlob
      };
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar certificado PDF');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = (url: string, filename: string, isBlob = false) => {
    console.log('💾 Iniciando download:', { url: isBlob ? 'blob-url' : url, filename });
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpar blob URL se necessário
    if (isBlob) {
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    }
    
    console.log('✅ Download iniciado com sucesso');
  };

  return {
    generatePDF,
    downloadPDF,
    openCertificateInNewTab,
    isGenerating
  };
};
