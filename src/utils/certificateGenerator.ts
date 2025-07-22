import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface CertificateData {
  userName: string;
  solutionTitle: string;
  completedDate: string;
  certificateId: string;
}

export const generateCertificatePDF = async (certificateData: CertificateData): Promise<Blob> => {
  // Create a temporary div with certificate content
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '800px';
  tempDiv.style.height = '600px';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.padding = '40px';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  
  tempDiv.innerHTML = `
    <div style="text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="margin-bottom: 30px;">
          <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3B82F6, #8B5CF6); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <span style="color: #3B82F6; font-size: 24px; font-weight: bold;">✓</span>
            </div>
          </div>
          <h1 style="font-size: 36px; font-weight: bold; color: #1F2937; margin: 0;">Certificado de Conclusão</h1>
          <p style="font-size: 18px; color: #6B7280; margin: 10px 0;">VIA - Viverde IA</p>
        </div>
        
        <div style="margin: 40px 0;">
          <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Certificamos que</p>
          <h2 style="font-size: 32px; font-weight: bold; color: #3B82F6; margin: 20px 0; padding-bottom: 10px; border-bottom: 2px solid #3B82F6;">${certificateData.userName}</h2>
          <p style="font-size: 18px; color: #374151; margin: 20px 0;">concluiu com sucesso a implementação da solução</p>
          <h3 style="font-size: 24px; font-weight: 600; color: #8B5CF6; margin: 20px 0;">"${certificateData.solutionTitle}"</h3>
          <p style="font-size: 16px; color: #6B7280; margin: 30px 0;">demonstrando dedicação e competência na aplicação de soluções de Inteligência Artificial</p>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: end; margin-top: 40px;">
        <div style="text-align: left;">
          <p style="font-size: 14px; color: #6B7280; margin: 0;">Data de Conclusão:</p>
          <p style="font-weight: 600; color: #1F2937; margin: 5px 0 0 0;">${certificateData.completedDate}</p>
        </div>
        
        <div style="text-align: center;">
          <div style="width: 120px; height: 60px; background: linear-gradient(90deg, #3B82F6, #8B5CF6); opacity: 0.2; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
            <span style="font-size: 10px; font-weight: bold; color: #3B82F6;">ASSINATURA DIGITAL</span>
          </div>
          <p style="font-size: 10px; color: #9CA3AF; margin: 0;">ID: ${certificateData.certificateId}</p>
        </div>
        
        <div style="text-align: right;">
          <p style="font-size: 14px; color: #6B7280; margin: 0;">Emitido por:</p>
          <p style="font-weight: 600; color: #1F2937; margin: 5px 0 0 0;">VIA - Viverde IA</p>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(tempDiv);
  
  try {
    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true
    });
    
    // Create PDF
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = (pdfHeight - imgHeight * ratio) / 2;
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    return pdf.output('blob');
  } finally {
    document.body.removeChild(tempDiv);
  }
};

export const downloadCertificate = async (certificateData: CertificateData) => {
  try {
    const pdfBlob = await generateCertificatePDF(certificateData);
    const url = URL.createObjectURL(pdfBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificado-${certificateData.solutionTitle.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao gerar certificado:', error);
    throw error;
  }
};

export const openCertificateInNewTab = async (certificateData: CertificateData) => {
  try {
    const pdfBlob = await generateCertificatePDF(certificateData);
    const url = URL.createObjectURL(pdfBlob);
    
    window.open(url, '_blank');
    
    // Clean up after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    console.error('Erro ao abrir certificado:', error);
    throw error;
  }
};