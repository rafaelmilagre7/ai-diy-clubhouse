
import { useCallback } from 'react';

export function useLinkGenerator() {
  const getInviteLink = useCallback((token: string) => {
    // Verificar se o token existe
    if (!token) {
      console.error("Erro: Token vazio ao gerar link de convite");
      return "";
    }
    
    // Limpar o token de espaços e normalizar
    const cleanToken = token.trim().replace(/[\s\n\r\t]+/g, '');
    
    console.log("Gerando link de convite para token:", {
      original: token,
      limpo: cleanToken,
      comprimento: cleanToken.length
    });
    
    // Verificação de integridade do token
    if (!cleanToken.match(/^[A-Z0-9]+$/i)) {
      console.warn("Token contém caracteres não alfanuméricos:", token);
    }
    
    // Detectar ambiente e usar URL apropriada
    const isProduction = window.location.hostname === 'app.viverdeia.ai' || 
                        window.location.hostname === 'ai-diy-clubhouse.lovable.app';
    
    const baseUrl = isProduction 
      ? 'https://app.viverdeia.ai' 
      : window.location.origin;
    
    const inviteUrl = `${baseUrl}/convite/${encodeURIComponent(cleanToken)}`;
    
    console.log("URL do convite gerado:", inviteUrl);
    console.log("Ambiente detectado:", isProduction ? 'produção' : 'desenvolvimento');
    
    return inviteUrl;
  }, []);

  return { getInviteLink };
}
