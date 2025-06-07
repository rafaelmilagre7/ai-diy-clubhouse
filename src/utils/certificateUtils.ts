
// Utilitário para converter imagem para base64
export const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
  console.log('Iniciando conversão de imagem para base64:', imageUrl);
  
  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error('Erro HTTP ao buscar imagem:', {
        status: response.status,
        statusText: response.statusText,
        url: imageUrl
      });
      throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('Blob criado com sucesso:', {
      size: blob.size,
      type: blob.type
    });
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        console.log('Conversão para base64 concluída com sucesso');
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        console.error('Erro no FileReader:', error);
        reject(new Error('Erro ao converter blob para base64'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erro ao converter imagem para base64:', error);
    throw error; // Propagate o erro sem fallback
  }
};

// Função para gerar HTML do certificado com fundo preto e dimensões A4 landscape
export const generateCertificateHTML = (
  certificate: any,
  userProfile: any,
  formattedDate: string,
  logoBase64: string
) => {
  console.log('Gerando HTML do certificado com dados:', {
    certificateId: certificate.id,
    userName: userProfile.name,
    solutionTitle: certificate.solutions.title,
    logoBase64Length: logoBase64.length
  });

  return `
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            background: #000000;
          }
          
          .certificate-container {
            width: 1123px;
            height: 794px;
            background: #000000;
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border: 2px solid #333333;
            margin: 0 auto;
          }
          
          .logo-container {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
          }
          
          .logo {
            width: 180px;
            height: 90px;
            object-fit: contain;
            filter: brightness(1.1);
          }
          
          .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 20px 0;
          }
          
          .certificate-title {
            font-size: 48px;
            margin-bottom: 12px;
            font-weight: bold;
            color: #ffffff;
            text-shadow: 0 4px 8px rgba(255,255,255,0.1);
            letter-spacing: 2px;
          }
          
          .subtitle {
            font-size: 20px;
            margin-bottom: 30px;
            color: #e5e5e5;
            font-weight: 600;
          }
          
          .certification-text {
            font-size: 18px;
            margin-bottom: 20px;
            color: #d5d5d5;
            font-weight: 500;
          }
          
          .user-name-box {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 16px;
            margin: 20px 0;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 8px 16px rgba(255,255,255,0.05);
          }
          
          .user-name {
            font-size: 28px;
            font-weight: bold;
            margin: 0;
            color: #ffffff;
            letter-spacing: 1px;
          }
          
          .solution-box {
            background: rgba(255,255,255,0.08);
            padding: 20px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.15);
            margin: 20px 0;
            box-shadow: 0 8px 16px rgba(255,255,255,0.05);
          }
          
          .solution-title {
            font-size: 22px;
            margin: 0;
            margin-bottom: 8px;
            color: #ffffff;
            font-weight: 600;
          }
          
          .solution-category {
            color: #cccccc;
            margin: 0;
            font-size: 16px;
          }
          
          .date-text {
            font-size: 18px;
            margin: 20px 0;
            color: #d5d5d5;
            font-weight: 500;
          }
          
          .date-highlight {
            font-weight: 700;
            font-size: 20px;
            color: #ffffff;
          }
          
          .footer {
            border-top: 2px solid rgba(255,255,255,0.2);
            padding-top: 25px;
            margin-top: 25px;
          }
          
          .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: end;
            margin-bottom: 15px;
          }
          
          .validation-section {
            text-align: left;
          }
          
          .validation-label {
            font-size: 12px;
            color: #cccccc;
            margin: 0;
            margin-bottom: 6px;
            font-weight: 500;
          }
          
          .validation-code {
            font-family: monospace;
            color: #ffffff;
            margin: 0;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 2px;
            background: rgba(255,255,255,0.1);
            padding: 3px 10px;
            border-radius: 6px;
          }
          
          .signature-section {
            text-align: right;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
          
          .signature-name {
            font-family: 'Dancing Script', cursive;
            font-size: 32px;
            margin: 0;
            color: #ffffff;
            transform: rotate(-1deg);
            text-shadow: 2px 2px 4px rgba(255,255,255,0.2);
            font-weight: 700;
            line-height: 1;
            margin-bottom: 10px;
          }
          
          .signature-line {
            width: 180px;
            height: 2px;
            background: rgba(255,255,255,0.3);
            margin-bottom: 10px;
          }
          
          .signature-title {
            font-size: 12px;
            color: #cccccc;
            margin: 0;
            font-weight: 500;
          }
          
          .footer-brand {
            text-align: center;
            padding-top: 12px;
          }
          
          .footer-brand-text {
            font-size: 12px;
            color: #aaaaaa;
            margin: 0;
          }
          
          .brand-name {
            color: #ffffff;
            font-weight: 700;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="logo-container">
            <img src="${logoBase64}" alt="Viver de IA" class="logo" />
          </div>
          
          <div class="main-content">
            <h1 class="certificate-title">CERTIFICADO</h1>
            <p class="subtitle">de Implementação de Solução</p>
            
            <p class="certification-text">Certificamos que</p>
            
            <div class="user-name-box">
              <h2 class="user-name">${userProfile.name}</h2>
            </div>
            
            <p class="certification-text">concluiu com sucesso a implementação da solução</p>
            
            <div class="solution-box">
              <h3 class="solution-title">${certificate.solutions.title}</h3>
              <p class="solution-category">Categoria: ${certificate.solutions.category}</p>
            </div>
            
            <p class="date-text">em <span class="date-highlight">${formattedDate}</span></p>
          </div>
          
          <div class="footer">
            <div class="footer-content">
              <div class="validation-section">
                <p class="validation-label">Código de Validação:</p>
                <p class="validation-code">${certificate.validation_code}</p>
              </div>
              
              <div class="signature-section">
                <div class="signature-name">Rafael G Milagre</div>
                <div class="signature-line"></div>
                <p class="signature-title">Founder do Viver de IA</p>
              </div>
            </div>
            
            <div class="footer-brand">
              <p class="footer-brand-text">
                Emitido por <span class="brand-name">Viver de IA</span>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
