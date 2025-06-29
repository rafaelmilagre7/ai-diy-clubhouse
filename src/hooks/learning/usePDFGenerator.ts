
import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async (
    certificateElement: HTMLElement,
    filename: string,
    certificateId: string
  ): Promise<{ url: string; filename: string } | null> => {
    setIsGenerating(true);
    
    try {
      // Capturar o elemento HTML como canvas
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#000000',
        width: 1123,
        height: 794
      });

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
      
      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(`solution-certificates/${filename}`, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(`solution-certificates/${filename}`);

      // Atualizar registro do certificado com a URL
      await supabase
        .from('solution_certificates')
        .update({
          certificate_url: publicUrl,
          certificate_filename: filename
        })
        .eq('id', certificateId);

      return {
        url: publicUrl,
        filename
      };
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar certificado PDF');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    generatePDF,
    downloadPDF,
    isGenerating
  };
};
