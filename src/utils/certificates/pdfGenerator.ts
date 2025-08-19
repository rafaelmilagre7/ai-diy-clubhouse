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
      margins = { top: 0, right: 0, bottom: 0, left: 0 }
    } = options;

    try {
      console.log('🎨 Iniciando geração de PDF do certificado...');

      // Garantir que o elemento esteja pronto
      await this.waitForImages(element);
      await this.waitForFonts();

      // Configurar canvas
      const canvas = await html2canvas(element, {
        scale,
        backgroundColor: null,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 15000,
        logging: false,
        width: 1123,
        height: 920,
        windowWidth: 1123,
        windowHeight: 920
      });

      console.log('📸 Canvas gerado:', {
        width: canvas.width,
        height: canvas.height
      });

      // Criar PDF com dimensões customizadas para o certificado
      const pdfWidthMM = (1123 * 0.264583); // Converter px para mm (1px = 0.264583mm)
      const pdfHeightMM = (920 * 0.264583);
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pdfWidthMM, pdfHeightMM]
      });

      const imgData = canvas.toDataURL('image/png', quality);
      
      // Usar toda a página sem margens
      const finalWidth = pdf.internal.pageSize.getWidth();
      const finalHeight = pdf.internal.pageSize.getHeight();

      // Adicionar imagem ocupando toda a página
      pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight);

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
    tempDiv.style.height = '920px';
    
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