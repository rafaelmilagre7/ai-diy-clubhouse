import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CertificateData } from './templateEngine';

export interface PDFGenerationOptions {
  scale?: number;
  quality?: number;
  format?: 'a4' | 'letter';
  orientation?: 'landscape' | 'portrait';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export class CertificatePDFGenerator {
  private static instance: CertificatePDFGenerator;

  public static getInstance(): CertificatePDFGenerator {
    if (!CertificatePDFGenerator.instance) {
      CertificatePDFGenerator.instance = new CertificatePDFGenerator();
    }
    return CertificatePDFGenerator.instance;
  }

  public async generateFromElement(
    element: HTMLElement, 
    data: CertificateData,
    options: PDFGenerationOptions = {}
  ): Promise<Blob> {
    const {
      scale = 2,
      quality = 1.0,
      format = 'a4',
      orientation = 'landscape',
      margins = { top: 10, right: 10, bottom: 10, left: 10 }
    } = options;

    try {
      console.log('🎨 Iniciando geração de PDF do certificado...');

      // Garantir que o elemento esteja pronto
      await this.waitForImages(element);
      await this.waitForFonts();

      // Configurar canvas
      const canvas = await html2canvas(element, {
        scale,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
        imageTimeout: 15000,
        logging: false,
        width: 1123,
        height: 794,
        windowWidth: 1123,
        windowHeight: 794
      });

      console.log('📸 Canvas gerado:', {
        width: canvas.width,
        height: canvas.height
      });

      // Criar PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      const imgData = canvas.toDataURL('image/png', quality);
      
      // Calcular dimensões
      const pdfWidth = pdf.internal.pageSize.getWidth() - margins.left - margins.right;
      const pdfHeight = pdf.internal.pageSize.getHeight() - margins.top - margins.bottom;
      
      const canvasAspectRatio = canvas.width / canvas.height;
      const pdfAspectRatio = pdfWidth / pdfHeight;
      
      let finalWidth, finalHeight, x, y;
      
      if (canvasAspectRatio > pdfAspectRatio) {
        // Canvas é mais largo - ajustar pela largura
        finalWidth = pdfWidth;
        finalHeight = pdfWidth / canvasAspectRatio;
        x = margins.left;
        y = margins.top + (pdfHeight - finalHeight) / 2;
      } else {
        // Canvas é mais alto - ajustar pela altura
        finalHeight = pdfHeight;
        finalWidth = pdfHeight * canvasAspectRatio;
        x = margins.left + (pdfWidth - finalWidth) / 2;
        y = margins.top;
      }

      // Adicionar imagem ao PDF
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

      // Adicionar metadados
      pdf.setProperties({
        title: `Certificado - ${data.userName}`,
        subject: `Certificado de conclusão - ${data.solutionTitle}`,
        author: 'VIVER DE IA',
        creator: 'VIVER DE IA Platform',
        keywords: 'certificado, VIVER DE IA, IA, inteligência artificial'
      });

      console.log('✅ PDF gerado com sucesso');
      return pdf.output('blob');

    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      throw new Error(`Falha na geração do PDF: ${error.message}`);
    }
  }

  public async generateFromHTML(
    html: string, 
    css: string, 
    data: CertificateData,
    options: PDFGenerationOptions = {}
  ): Promise<Blob> {
    // Criar elemento temporário
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '1123px';
    tempDiv.style.height = '794px';
    
    // Adicionar estilos
    const styleEl = document.createElement('style');
    styleEl.textContent = css;
    tempDiv.appendChild(styleEl);
    
    // Adicionar HTML
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = html;
    tempDiv.appendChild(contentDiv);
    
    document.body.appendChild(tempDiv);
    
    try {
      const blob = await this.generateFromElement(contentDiv, data, options);
      return blob;
    } finally {
      document.body.removeChild(tempDiv);
    }
  }

  private async waitForImages(element: HTMLElement): Promise<void> {
    const images = element.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn('⚠️ Timeout ao carregar imagem:', img.src);
          resolve(); // Continuar mesmo com timeout
        }, 10000);

        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          console.warn('⚠️ Erro ao carregar imagem:', img.src);
          resolve(); // Continuar mesmo com erro
        };
      });
    });
    
    await Promise.all(promises);
    console.log('🖼️ Todas as imagens carregadas');
  }

  private async waitForFonts(): Promise<void> {
    if ('fonts' in document) {
      try {
        await document.fonts.ready;
        console.log('🔤 Fontes carregadas');
      } catch (error) {
        console.warn('⚠️ Erro ao carregar fontes:', error);
      }
    }
    
    // Aguardar um pouco extra para garantir
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  public async downloadPDF(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpar URL após um delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  public async openPDFInNewTab(blob: Blob): Promise<void> {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Limpar URL após um delay
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}

export const pdfGenerator = CertificatePDFGenerator.getInstance();