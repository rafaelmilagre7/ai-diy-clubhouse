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
    <div style="
      text-align: center; 
      height: 100%; 
      display: flex; 
      flex-direction: column; 
      justify-content: space-between;
      background: linear-gradient(135deg, #0F0F23 0%, #1A1A3E 25%, #2D1B69 50%, #1A1A3E 75%, #0F0F23 100%);
      border-radius: 16px;
      position: relative;
      overflow: hidden;
    ">
      <!-- Aurora particles -->
      <div style="position: absolute; top: 40px; left: 40px; width: 16px; height: 16px; background: rgba(138, 92, 246, 0.3); border-radius: 50%; animation: float 6s ease-in-out infinite;"></div>
      <div style="position: absolute; top: 80px; right: 80px; width: 12px; height: 12px; background: rgba(59, 130, 246, 0.3); border-radius: 50%; animation: float 8s ease-in-out infinite reverse;"></div>
      <div style="position: absolute; bottom: 80px; left: 64px; width: 8px; height: 8px; background: rgba(16, 185, 129, 0.3); border-radius: 50%; animation: float 7s ease-in-out infinite;"></div>
      
      <div style="position: relative; z-index: 10; padding: 40px;">
        <div style="margin-bottom: 40px;">
          <div style="
            width: 96px; 
            height: 96px; 
            background: linear-gradient(135deg, #8A5CF6, #3B82F6, #10B981); 
            border-radius: 50%; 
            margin: 0 auto 24px; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            padding: 4px;
            box-shadow: 0 0 40px rgba(138, 92, 246, 0.4);
          ">
            <div style="
              width: 100%; 
              height: 100%; 
              background: #1A1A3E; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center;
            ">
              <svg style="width: 48px; height: 48px; color: #8A5CF6;" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
              </svg>
            </div>
          </div>
          
          <h1 style="
            font-size: 48px; 
            font-weight: bold; 
            background: linear-gradient(135deg, #8A5CF6, #3B82F6, #10B981);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0 0 16px 0;
          ">Certificado de Conclusão</h1>
          
          <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 8px;">
            <div style="width: 32px; height: 2px; background: linear-gradient(90deg, #8A5CF6, #3B82F6); border-radius: 2px;"></div>
            <p style="font-size: 24px; color: #E5E7EB; font-weight: 600; margin: 0;">VIA</p>
            <div style="width: 32px; height: 2px; background: linear-gradient(90deg, #3B82F6, #10B981); border-radius: 2px;"></div>
          </div>
          <p style="font-size: 18px; color: #9CA3AF; margin: 0;">Viverde Inteligência Artificial</p>
        </div>
        
        <div style="margin: 40px 0;">
          <p style="font-size: 20px; color: #D1D5DB; margin-bottom: 24px; font-weight: 300;">Certificamos que</p>
          
          <div style="margin-bottom: 32px;">
            <h2 style="
              font-size: 40px; 
              font-weight: bold; 
              background: linear-gradient(135deg, #8A5CF6, #3B82F6);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              margin: 0 0 16px 0; 
              padding: 12px 24px;
            ">${certificateData.userName}</h2>
            <div style="height: 2px; width: 128px; background: linear-gradient(90deg, #8A5CF6, #3B82F6); margin: 0 auto; border-radius: 2px;"></div>
          </div>
          
          <p style="font-size: 20px; color: #D1D5DB; margin: 24px 0; font-weight: 300;">concluiu com sucesso a implementação da solução</p>
          
          <div style="
            margin: 32px 0; 
            padding: 24px; 
            background: rgba(138, 92, 246, 0.1); 
            border-radius: 12px; 
            border: 1px solid rgba(138, 92, 246, 0.2);
          ">
            <h3 style="font-size: 28px; font-weight: 600; color: #3B82F6; margin: 0;">"${certificateData.solutionTitle}"</h3>
          </div>
          
          <p style="font-size: 18px; color: #9CA3AF; margin: 0; line-height: 1.6; max-width: 600px; margin-left: auto; margin-right: auto;">
            demonstrando dedicação e competência na aplicação de soluções de Inteligência Artificial
          </p>
        </div>
      </div>
      
      <div style="
        display: flex; 
        justify-content: space-between; 
        align-items: end; 
        padding: 0 40px 40px 40px;
        position: relative;
        z-index: 10;
      ">
        <div style="text-align: left;">
          <p style="font-size: 14px; color: #9CA3AF; margin: 0 0 4px 0;">Data de Conclusão</p>
          <p style="font-weight: 600; color: #E5E7EB; margin: 0; font-size: 18px;">${certificateData.completedDate}</p>
        </div>
        
        <div style="text-align: center;">
          <div style="
            width: 160px; 
            height: 80px; 
            background: rgba(138, 92, 246, 0.1); 
            border-radius: 12px; 
            display: flex; 
            flex-direction: column;
            align-items: center; 
            justify-content: center; 
            margin-bottom: 12px;
            border: 1px solid rgba(138, 92, 246, 0.2);
          ">
            <div style="
              width: 32px; 
              height: 32px; 
              background: linear-gradient(135deg, #8A5CF6, #3B82F6); 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              margin-bottom: 8px;
            ">
              <svg style="width: 16px; height: 16px; color: white;" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span style="font-size: 10px; font-weight: bold; color: #8A5CF6;">ASSINATURA DIGITAL</span>
          </div>
          <p style="font-size: 10px; color: #6B7280; margin: 0;">ID: ${certificateData.certificateId}</p>
        </div>
        
        <div style="text-align: right;">
          <p style="font-size: 14px; color: #9CA3AF; margin: 0 0 4px 0;">Emitido por</p>
          <p style="font-weight: 600; color: #E5E7EB; margin: 0; font-size: 18px;">VIA - Viverde IA</p>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
    </style>`;
  
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