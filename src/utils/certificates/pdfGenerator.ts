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

    let canvasTimeoutId: NodeJS.Timeout;
    
    try {
      console.log('🎨 [PDF-ELEMENT] Iniciando geração de PDF do elemento...');

      // Timeout para html2canvas
      const canvasTimeoutPromise = new Promise((_, reject) => {
        canvasTimeoutId = setTimeout(() => {
          reject(new Error('Timeout no html2canvas (20s)'));
        }, 20000);
      });
      
      console.log('⏳ [PDF-ELEMENT] Aguardando imagens e fontes...');
      // Garantir que o elemento esteja pronto com timeout reduzido
      await Promise.all([
        this.waitForImages(element),
        this.waitForFonts()
      ]);

      console.log('📸 [PDF-ELEMENT] Capturando canvas...');
      // Canvas generation com configurações otimizadas
      const canvasPromise = html2canvas(element, {
        scale,
        backgroundColor: '#0A0D0F',
        useCORS: true,
        allowTaint: false,
        imageTimeout: 8000,
        logging: true, // Habilitar logs para debug
        width: 1123,
        height: 950,
        windowWidth: 1123,
        windowHeight: 950,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: false, // Desabilitar para melhor compatibilidade
        removeContainer: true, // Limpar container após uso
        ignoreElements: (el) => {
          return el.classList?.contains('ignore-pdf') || 
                 el.tagName === 'SCRIPT' || 
                 el.tagName === 'STYLE';
        },
        onclone: (clonedDoc, element) => {
          console.log('🔧 [PDF-ELEMENT] Configurando clone para captura...');
          
          // Garantir backgrounds e estilos no clone
          const certificateContainer = clonedDoc.querySelector('.certificate-container') as HTMLElement;
          if (certificateContainer) {
            certificateContainer.style.cssText += `
              background: #0F1114 !important;
              background-attachment: local !important;
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            `;
          }
          
          // Aplicar estilos críticos a todos os elementos
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el: any) => {
            if (el.style) {
              el.style.webkitTransform = 'none';
              el.style.transform = 'none';
              el.style.webkitFilter = 'none';
              el.style.filter = 'none';
            }
          });
        }
      }).catch((canvasError) => {
        console.error('❌ [PDF-ELEMENT] html2canvas falhou:', canvasError);
        throw new Error(`Falha no html2canvas: ${canvasError.message || 'Erro desconhecido'}`);
      });
      
      // Corrida entre canvas generation e timeout
      const canvas = await Promise.race([canvasPromise, canvasTimeoutPromise]) as HTMLCanvasElement;
      
      clearTimeout(canvasTimeoutId);

      console.log('📸 Canvas gerado:', {
        width: canvas.width,
        height: canvas.height
      });

      // Criar PDF com dimensões customizadas para o certificado
      const pdfWidthMM = (1123 * 0.264583); // Converter px para mm (1px = 0.264583mm)
      const pdfHeightMM = (950 * 0.264583);
      
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

    } catch (error: any) {
      clearTimeout(canvasTimeoutId!);
      
      // Log detalhado para debug
      console.error('❌ [PDF-ELEMENT] Erro detalhado:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        canvasError: error
      });
      
      // Diagnosticar e fornecer mensagem específica
      let errorMessage = 'Erro na geração do PDF';
      
      if (error?.message?.includes('Timeout')) {
        errorMessage = 'Tempo esgotado na captura da imagem. Tente novamente.';
      } else if (error?.message?.includes('SecurityError')) {
        errorMessage = 'Erro de segurança - Problema com imagens ou CORS';
      } else if (error?.message?.includes('html2canvas')) {
        errorMessage = 'Falha na conversão para imagem';
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      throw new Error(errorMessage);
    }
  }

  public async generateFromHTML(
    html: string, 
    css: string, 
    data: CertificateData,
    options: PDFGenerationOptions = {}
  ): Promise<Blob> {
    console.log('🎨 [PDF-GEN] Iniciando geração a partir de HTML...');
    let tempDiv: HTMLDivElement | null = null;
    let timeoutId: NodeJS.Timeout;
    
    try {
      // Timeout interno de 25 segundos
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Timeout na renderização HTML (25s)'));
        }, 25000);
      });
      
      // Elemento temporário otimizado
      tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        position: fixed;
        left: -10000px;
        top: 0;
        width: 1123px;
        height: 950px;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
      `;
      
      console.log('🔧 [PDF-GEN] Inserindo HTML no DOM...');
      tempDiv.innerHTML = `<style>${css}</style>${html}`;
      document.body.appendChild(tempDiv);
      
      // Aguardar renderização com timeout
      const renderingPromise = (async () => {
        console.log('⏳ [PDF-GEN] Aguardando fontes e renderização...');
        await Promise.all([
          this.waitForFonts(),
          new Promise(resolve => setTimeout(resolve, 800))
        ]);

        const certificateElement = tempDiv!.querySelector('.certificate-container, .pixel-perfect-certificate') as HTMLElement;
        if (!certificateElement) {
          console.error('❌ [PDF-GEN] Elementos não encontrados. HTML inserido:', tempDiv!.innerHTML.substring(0, 300));
          throw new Error('Elemento do certificado não encontrado no template - verifique se .certificate-container ou .pixel-perfect-certificate existe');
        }

        console.log('📸 [PDF-GEN] Elemento encontrado, gerando canvas...');
        return this.generateFromElement(certificateElement, data, options);
      })();
      
      // Corrida entre renderização e timeout
      const blob = await Promise.race([renderingPromise, timeoutPromise]) as Blob;
      
      clearTimeout(timeoutId!);
      console.log('✅ [PDF-GEN] PDF gerado com sucesso a partir do HTML');
      return blob;
      
    } catch (error: any) {
      clearTimeout(timeoutId!);
      
      // Log detalhado do erro para debug
      console.error('❌ [PDF-GEN] Erro na geração:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        error: error
      });
      
      // Diagnosticar tipo de erro
      let errorMessage = 'Erro desconhecido na geração do PDF';
      
      if (error?.message?.includes('Timeout')) {
        errorMessage = 'Tempo esgotado - O processo de geração demorou muito. Tente novamente.';
      } else if (error?.message?.includes('não encontrado')) {
        errorMessage = 'Template inválido - Estrutura do certificado não encontrada';
      } else if (error?.message?.includes('html2canvas')) {
        errorMessage = 'Erro na captura - Falha ao converter o certificado em imagem';
      } else if (error?.name === 'NetworkError') {
        errorMessage = 'Erro de conexão - Verifique sua internet e tente novamente';
      } else if (error?.message) {
        errorMessage = `Falha na geração: ${error.message}`;
      }
      
      throw new Error(errorMessage);
      
    } finally {
      // Cleanup seguro
      if (tempDiv && tempDiv.parentNode) {
        try {
          document.body.removeChild(tempDiv);
          console.log('🧹 [PDF-GEN] Cleanup do DOM concluído');
        } catch (cleanupError) {
          console.warn('⚠️ [PDF-GEN] Erro no cleanup (não crítico):', cleanupError);
        }
      }
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
    if ('fonts' in document && document.fonts) {
      try {
        await document.fonts.ready;
        console.log('🔤 Fontes carregadas');
        
        // Forçar carregamento de fontes específicas do certificado
        const fonts = [
          'Inter',
          'JetBrains Mono',
          'Brush Script MT'
        ];
        
        await Promise.allSettled(
          fonts.map(font => document.fonts.load(`16px "${font}"`))
        );
        
      } catch (error) {
        console.warn('⚠️ Erro ao carregar fontes:', error);
      }
    }
    
    // Aguardar estabilização da renderização
    await new Promise(resolve => setTimeout(resolve, 300));
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