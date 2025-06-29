
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
    isGenerating
  };
};
