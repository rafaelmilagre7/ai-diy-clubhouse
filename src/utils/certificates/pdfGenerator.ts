import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CertificateData } from './templateEngine';

export interface PDFGenerationOptions {
  scale?: number;
  quality?: number;
  format?: 'a4' | 'letter';
  orientation?: 'landscape' | 'portrait';
}

export const pdfGenerator = {
  generateFromElement: async (element: HTMLElement, data: CertificateData): Promise<Blob> => {
    console.log('🎯 pdfGenerator.generateFromElement: Iniciando captura do elemento');
    
    if (!element) {
      throw new Error('Elemento não fornecido para captura');
    }

    // Renderizar temporariamente na tela para captura
    const originalPosition = element.style.position;
    const originalTop = element.style.top;
    const originalLeft = element.style.left;
    const originalZIndex = element.style.zIndex;
    const originalVisibility = element.style.visibility;

    try {
      // Posicionar elemento temporariamente na tela
      element.style.position = 'fixed';
      element.style.top = '0px';
      element.style.left = '0px';
      element.style.zIndex = '9999';
      element.style.visibility = 'visible';

      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0A0D0F',
        scale: 2,
        width: 1200,
        height: 900,
        logging: true,
        onclone: (clonedDoc) => {
          console.log('🔄 html2canvas: Documento clonado para captura');
          const clonedElement = clonedDoc.querySelector('.pixel-perfect-certificate');
          if (clonedElement) {
            console.log('✅ html2canvas: Elemento encontrado no clone');
            // Aplicar estilos compatíveis com html2canvas
            const gradientTexts = clonedElement.querySelectorAll('.certificate-gradient-text');
            gradientTexts.forEach(text => {
              (text as HTMLElement).style.color = '#7CF6FF';
              (text as HTMLElement).style.background = 'none';
              (text as HTMLElement).style.webkitBackgroundClip = 'unset';
              (text as HTMLElement).style.webkitTextFillColor = 'unset';
            });
          } else {
            console.warn('⚠️ html2canvas: Elemento não encontrado no clone');
          }
        }
      });

      console.log(`📊 html2canvas: Canvas criado com dimensões ${canvas.width}x${canvas.height}`);
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas gerado com dimensões inválidas');
      }

      // Debug: Verificar se o canvas tem conteúdo
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const hasContent = imageData.data.some(channel => channel !== 0);
        console.log(`🔍 Canvas tem conteúdo: ${hasContent}`);

        if (!hasContent) {
          console.warn('⚠️ Canvas capturado está vazio - tentativa de fallback');
        }
      }

      // Criar PDF com dimensões exatas do certificado
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1200, 900]
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Adicionar imagem ocupando toda a página
      pdf.addImage(imgData, 'PNG', 0, 0, 1200, 900);

      // Metadados do PDF
      pdf.setProperties({
        title: `Certificado - ${data.userName}`,
        subject: `Certificado de conclusão - ${data.solutionTitle}`,
        author: 'VIVER DE IA',
        creator: 'VIVER DE IA Platform'
      });

      const pdfBlob = pdf.output('blob');
      console.log('✅ PDF gerado com sucesso');
      
      return pdfBlob;
    } catch (error) {
      console.error('❌ Erro na captura do elemento:', error);
      throw error;
    } finally {
      // Restaurar posição original do elemento
      element.style.position = originalPosition;
      element.style.top = originalTop;
      element.style.left = originalLeft;
      element.style.zIndex = originalZIndex;
      element.style.visibility = originalVisibility;
    }
  },

  generateFromHTML: async (html: string, css: string, data: CertificateData): Promise<Blob> => {
    console.log('🎨 pdfGenerator.generateFromHTML: Gerando PDF do HTML');
    
    // Criar elemento temporário
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '1200px';
    tempDiv.style.height = '900px';
    tempDiv.innerHTML = `<style>${css}</style>${html}`;
    
    document.body.appendChild(tempDiv);
    
    try {
      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const certificateElement = tempDiv.querySelector('.pixel-perfect-certificate, .certificate-container') as HTMLElement;
      if (!certificateElement) {
        throw new Error('Elemento do certificado não encontrado');
      }
      
      return await pdfGenerator.generateFromElement(certificateElement, data);
    } finally {
      document.body.removeChild(tempDiv);
    }
  },

  downloadPDF: async (blob: Blob, filename: string): Promise<void> => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  openPDFInNewTab: async (blob: Blob): Promise<void> => {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
};