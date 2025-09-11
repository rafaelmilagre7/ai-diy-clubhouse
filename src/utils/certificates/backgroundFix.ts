// Utilitário para garantir que o fundo dos certificados seja renderizado corretamente

export const applyCertificateBackgroundFix = () => {
  // Aplicar CSS global para garantir renderização correta dos backgrounds
  const style = document.createElement('style');
  style.id = 'certificate-background-fix';
  
  style.textContent = `
    /* Garantir que backgrounds sejam preservados em PDF */
    .certificate-container {
      background: linear-gradient(135deg, #00c9a7 0%, #00a688 50%, #008f75 100%) !important;
      background-attachment: local !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    /* Forçar renderização de background em elementos filhos */
    .certificate-container * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    /* Garantir que o fundo não seja substituído por branco */
    .certificate-container,
    .certificate-container::before,
    .certificate-content {
      background-clip: padding-box !important;
      background-origin: padding-box !important;
    }
  `;
  
  // Remover estilo anterior se existir
  const existingStyle = document.getElementById('certificate-background-fix');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Adicionar novo estilo
  document.head.appendChild(style);
  
  console.log('🎨 Fix de background para certificados aplicado');
};

export const removeCertificateBackgroundFix = () => {
  const existingStyle = document.getElementById('certificate-background-fix');
  if (existingStyle) {
    existingStyle.remove();
    console.log('🎨 Fix de background para certificados removido');
  }
};

// Auto-aplicar quando o módulo for importado
if (typeof window !== 'undefined') {
  // Aplicar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyCertificateBackgroundFix);
  } else {
    applyCertificateBackgroundFix();
  }
}