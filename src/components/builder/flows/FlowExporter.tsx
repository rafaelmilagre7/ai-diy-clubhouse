import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export class FlowExporter {
  /**
   * Export diagram as PNG
   */
  static async exportAsPNG(elementId: string, filename: string = 'flow-diagram.png'): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento não encontrado');
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#0a0a0a',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  /**
   * Export diagram as SVG (if available in DOM)
   */
  static async exportAsSVG(elementId: string, filename: string = 'flow-diagram.svg'): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento não encontrado');
    }

    // Procurar SVG dentro do elemento
    const svgElement = element.querySelector('svg');
    if (!svgElement) {
      throw new Error('SVG não encontrado no elemento');
    }

    // Serializar SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    
    // Criar blob e download
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Export diagram as PDF
   */
  static async exportAsPDF(elementId: string, filename: string = 'flow-diagram.pdf'): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento não encontrado');
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#0a0a0a',
      scale: 2,
      logging: false,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(filename);
  }

  /**
   * Copy diagram as image to clipboard
   */
  static async copyToClipboard(elementId: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento não encontrado');
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#0a0a0a',
      scale: 2,
      logging: false,
      useCORS: true
    });

    canvas.toBlob(async (blob) => {
      if (!blob) {
        throw new Error('Erro ao criar blob da imagem');
      }

      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      } catch (error) {
        console.error('Erro ao copiar para clipboard:', error);
        throw new Error('Não foi possível copiar para a área de transferência');
      }
    });
  }
}
